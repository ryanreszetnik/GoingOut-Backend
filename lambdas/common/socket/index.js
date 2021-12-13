const AWS = require("aws-sdk");
const Dynamo = require("../dynamo");
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: "v1gd96esu2.execute-api.ca-central-1.amazonaws.com/prod",
});
/*To get a list of connection Ids
  var AWS = require('aws-sdk');
  var lambda = new AWS.Lambda();
  
  
const sendWebsocket = async(request)=>{
  var websocketParams = {
    FunctionName: 'going-out-send-websocket', 
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(request)
  };
  return await lambda.invoke(websocketParams).promise()
}


4 options for the request object (payload is what actually gets recieved in the front end as the body):
*ignoreConnection is an optional field... if it does not exist it will send it to all the connections (can be used to ignore sending to the sender)
1. If you know the subs (best one to use if you can)
{
    subs:["abab","dsfsf"],
    action:"",
    payload:{},
    ignoreConnection:""
}
2. Send to a perm group
{
    permGroupId:"",
    action:"",
    payload:{},
    ignoreConnection:""
}
3. Send to an event
{
    eventId:"",
    action:"",
    payload:{},
    ignoreConnection:""
}
4. Send to a match
{
    eventId:"",
    matchId:"",
    action:"",
    payload:{},
    ignoreConnection:""
}




*/
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

const socketCall = async (event) => {
  let subs = [];
  const eventData = typeof event === "string" ? JSON.parse(event) : event;

  if (
    !eventData.hasOwnProperty("action") ||
    !eventData.hasOwnProperty("payload")
  ) {
    return "Input does not contain action and payload";
  }

  if (eventData.hasOwnProperty("subs")) {
    subs = eventData.subs;
  } else if (eventData.hasOwnProperty("permGroupId")) {
    subs = await getSubsInGroup(eventData.permGroupId);
  } else if (
    eventData.hasOwnProperty("matchId") &&
    eventData.hasOwnProperty("eventId")
  ) {
    subs = await getSubsInMatch(eventData.eventId, eventData.matchId);
  } else if (
    !eventData.hasOwnProperty("matchId") &&
    eventData.hasOwnProperty("eventId")
  ) {
    subs = await getSubsInEvent(eventData.eventId);
  } else {
    return "Input does not fit template";
  }

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
          if (connId !== eventData.ignoreConnection) {
            await apigwManagementApi
              .postToConnection({
                ConnectionId: connId,
                Data: JSON.stringify({
                  action: eventData.action,
                  body: eventData.payload,
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

module.exports = socketCall;
