const AWS = require("aws-sdk");
var documentClient = new AWS.DynamoDB.DocumentClient();
const getSingleItem = async (table, field, value) => {
  const params = {
    Key: {
      [field]: value,
    },
    TableName: table,
  };
  return (await documentClient.get(params).promise()).Item;
};

const get = async (tableName = "", keyFieldName = "", params = null) => {
  return await getSingleItem(tableName, keyFieldName, params);
  //   return { other: "good" };
};
exports.get = get;
