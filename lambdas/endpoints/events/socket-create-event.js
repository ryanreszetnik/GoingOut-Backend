const Responses = require("../../common/API_Responses");
const Formatting = require("../../common/Formatting");
const Dynamo = require("../../common/dynamo");
const Socket = require("../../common/socket");
const Database = require("../../common/CommonDatabaseCalls");
const SocketConstants = require("../../common/SocketConstants");
const Tables = require("../../common/TableConstants");

const createEvent = async (event, createdFromPerm) => {
  if (event.baseGroups.length === 1) {
    if (createdFromPerm) {
      await Dynamo.list_add(
        Tables.GROUPS,
        [{ groupId: event.baseGroups[0] }],
        "events",
        [event.eventId]
      );
    } else {
      await Dynamo.list_add(
        Tables.EVENTS,
        [{ eventId: event.baseGroups[0] }],
        "events",
        [event.eventId]
      );
    }
  } else if (event.baseGroups.length === 0) {
  } else {
    throw new Error("not possible initial groups");
  }
  await Dynamo.list_add(
    Tables.USERS,
    event.members.map((m) => {
      return { sub: m };
    }),
    "events",
    [event.eventId]
  );
  const ev = await Dynamo.put(Tables.EVENTS, event);
  const newEvent = await Database.updateEventAverages(
    event.eventId,
    ev.members
  );
  return newEvent;
};

exports.handler = async (event) => {
  const eventData = Formatting.ensureObject(event.body);
  const connectionId = event.requestContext.connectionId;
  const newEvent = await createEvent(
    eventData.event,
    eventData.createdFromPerm
  );
  await Socket.sendToSubs(
    SocketConstants.NEW_EVENT,
    newEvent,
    newEvent.members
  );
  return Responses._200_socket(
    SocketConstants.NEW_EVENT_CONFIRMATION,
    newEvent
  );
};
