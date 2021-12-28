const Responses = require("../../common/API_Responses");
const Formatting = require("../../common/Formatting");
const Dynamo = require("../../common/dynamo");
const Socket = require("../../common/socket");
const Database = require("../../common/CommonDatabaseCalls");
const SocketConstants = require("../../common/SocketConstants");
const Tables = require("../../common/TableConstants");
exports.handler = async (event) => {
  const eventData = Formatting.ensureObject(event.body);
  const connectionId = event.requestContext.connectionId;
  const tempEvent = await Dynamo.list_add(
    Tables.EVENTS,
    [{ eventId: eventData.eventId }],
    "members",
    eventData.members
  )[0];
  const newEvent = await Database.updateEventAverages(
    eventData.eventId,
    tempEvent.members
  );
  const oldSubs = newEvent.members.filter(
    (mem) => !eventData.members.some(mem)
  );
  await Dynamo.list_add(
    Tables.USERS,
    eventData.members.map((m) => {
      return { sub: m };
    }),
    "events",
    [eventData.eventId]
  );
  await Socket.sendToSubs(
    SocketConstants.EVENT_MEMBERS_ADDED,
    eventData,
    oldSubs,
    connectionId
  );
  await Socket.sendToSubs(
    SocketConstants.NEW_EVENT,
    newEvent,
    eventData.members
  );
  return Responses._200_socket(SocketConstants.EVENT_MEMBERS_ADDED, eventData);
};
