const AWS = require("aws-sdk");
const Dynamo = require("../dynamo");
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: "v1gd96esu2.execute-api.ca-central-1.amazonaws.com/prod",
});

const getSubsInMatch = async (eventId, matchId) => {
  const otherEventId = (
    await Dynamo.get("going-out-matches", {
      eventId: eventId,
      matchId: matchId,
    })
  ).otherEventId;
  const mainEventSubs = await getSubsInEvent(eventId);
  const otherEventSubs = await getSubsInEvent(otherEventId);
  return [...new Set([...mainEventSubs, ...otherEventSubs])];
};
const getSubsInEvent = async (eventId) => {
  return (await Dynamo.get("going-out-events", { eventId: eventId })).members;
};
const getSubsInGroup = async (groupId) => {
  return (await Dynamo.get("going-out-groups", { groupId: groupId })).members;
};

const getConnectionsForSub = async (sub) => {
  const item = await Dynamo.get("going-out-users", { sub: sub });
  return item.currentConnections ? item.currentConnections : [];
};
const removeConnection = async (connId) => {
  const sub = (
    await Dynamo.delete("going-out-connections", { connectionId: connId })
  ).sub;
  await Dynamo.list_remove(
    "going-out-users",
    [{ sub: sub }],
    "currentConnections",
    [connId]
  );
};

const socketCall = async (action, body, subs, ignoreConnection) => {
  let connections = [];
  await Promise.all(
    subs.map(async (sub) => {
      const subconnections = await getConnectionsForSub(sub);
      connections.push({ sub: sub, connections: subconnections });
    })
  );
  const postCalls = connections.map(async (conn) => {
    await Promise.all(
      conn.connections.map(async (connId) => {
        try {
          if (connId !== ignoreConnection) {
            await apigwManagementApi
              .postToConnection({
                ConnectionId: connId,
                Data: JSON.stringify({
                  action: action,
                  body: body,
                }),
              })
              .promise();
          }
        } catch (e) {
          if (e.statusCode === 410) {
            await removeConnection(connId);
          } else {
            throw e;
          }
        }
      })
    );
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return e.stack;
  }
  return connections;
};

const Responses = {
  async sendToSubs(action, body, subs, ignore = null) {
    return await socketCall(action, body, subs, ignore);
  },
  async sendToGroup(action, body, groupId, ignore = null) {
    const subs = await getSubsInGroup(groupId);
    return await socketCall(action, body, subs, ignore);
  },
  async sendToEvent(action, body, eventId, ignore = null) {
    const subs = await getSubsInEvent(eventId);
    return await socketCall(action, body, subs, ignore);
  },
  async sendToMatch(action, body, eventId, matchId, ignore = null) {
    const subs = await getSubsInMatch(eventId, matchId);
    return await socketCall(action, body, subs, ignore);
  },
};

module.exports = Responses;
