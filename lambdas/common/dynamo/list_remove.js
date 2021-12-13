const AWS = require("aws-sdk");
var documentClient = new AWS.DynamoDB.DocumentClient();

const getRemoveFieldParams = (
  tableName,
  key = { id: "123" },
  field,
  values
) => {
  return {
    ExpressionAttributeNames: {
      "#A": field,
    },
    ExpressionAttributeValues: {
      ":A": documentClient.createSet(values),
    },
    Key: key,
    ReturnValues: "ALL_NEW",
    TableName: tableName,
    UpdateExpression: "DELETE #A :A",
  };
};

const list_remove = async (
  table = "",
  keys = [{ id: "" }],
  field = "",
  values = []
) => {
  const returnValues = [];
  await Promise.all(
    keys.map(async (key) => {
      try {
        var params = getRemoveFieldParams(table, key, field, values);
        const items = await documentClient.update(params).promise();
        returnValues.push(items.Attributes);
      } catch (e) {}
    })
  );
  return returnValues;
};

exports.list_remove = list_remove;
