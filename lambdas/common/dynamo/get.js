const AWS = require("aws-sdk");
var documentClient = new AWS.DynamoDB.DocumentClient();
const getSingleItem = async (table, key) => {
  const params = {
    Key: key,
    TableName: table,
  };
  return (await documentClient.get(params).promise()).Item;
};
const getBatchItems = async (table, keys) => {
  const returnValues = [];

  const loopVales = [];
  while (keys.length) {
    const values = keys.splice(0, 25);
    loopVales.push(values);
  }
  await Promise.all(
    loopVales.map(async (value) => {
      try {
        const params = {
          RequestItems: {
            [table]: {
              Keys: value,
            },
          },
        };
        returnValues.push(
          (await documentClient.batchGet(params).promise()).Responses[table]
        );
      } catch (e) {}
    })
  );
  return returnValues;
};
const queryItems = async (table, key) => {
  const field = Object.keys(key)[0];
  const value = key[field];
  var params = {
    ExpressionAttributeValues: {
      ":v1": value,
    },
    KeyConditionExpression: `${field} = :v1`,
    TableName: table,
  };
  return (await documentClient.query(params).promise()).Items;
};

exports.get = getSingleItem;
exports.query = queryItems;
exports.getAll = getBatchItems;
