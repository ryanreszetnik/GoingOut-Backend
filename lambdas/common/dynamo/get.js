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
const queryItems = async (table, field, value) => {
  var params = {
    ExpressionAttributeValues: {
      ":v1": value,
    },
    KeyConditionExpression: `${field} = :v1`,
    TableName: table,
  };
  return (await documentClient.query(params).promise()).Items;
};

const get = async (tableName, key, query = false) => {
  if (query) {
    const name = Object.keys(key)[0];
    return await queryItems(tableName, name, key[name]);
  } else if (Array.isArray(key)) {
    return await getBatchItems(tableName, key);
  } else {
    return await getSingleItem(tableName, key);
  }
};
exports.get = get;
