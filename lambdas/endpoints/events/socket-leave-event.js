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
  const eventId = eventData.eventId;
  const sub = Database.getSubFromConnection(connectionId);
  const currentEvent = await Dynamo.get(Tables.EVENTS, { eventId: eventId });
  if (currentEvent.members.length > 1) {
    const temp = await Dynamo.list_remove(
      Tables.EVENTS,
      [{ eventId: eventId }],
      "members",
      [sub]
    );
    const newEvent = await Database.updateEventAverages(eventId, temp.members);
    await Socket.sendToSubs(
      SocketConstants.EVENT_OTHER_LEFT,
      { eventId: eventId, members: [sub] },
      newEvent.members
    );
  } else {
    await Dynamo.delete(Tables.EVENTS, { eventId: eventId });
  }
  await Dynamo.list_remove(Tables.USERS, [{ sub: sub }], "events", [eventId]);
  return Responses._200_socket(SocketConstants.EVENT_LEFT, {
    eventId: eventId,
    subs: [sub],
  });
};
