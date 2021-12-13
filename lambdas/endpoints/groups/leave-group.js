const Responses = require("../../common/API_Responses");
exports.handler = async (event) => {
  const resp = {};
  return Responses._200(resp);
};
