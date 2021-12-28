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
  const resp = {};
  return Responses._200_socket("", resp);
};
