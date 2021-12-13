const Responses = require("../../common/API_Responses");
const Dynamo = require("../../common/dynamo");

exports.handler = async (event) => {
  const resp = await Dynamo.get("testTable", { id: "1" });
  //   const resp = { text: "hello" };
  return Responses._200(resp);
};
