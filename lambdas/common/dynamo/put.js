const AWS = require("aws-sdk");
var documentClient = new AWS.DynamoDB.DocumentClient();

const updateItem = async (table, item) => {
  const params = {
    Item: item,
    TableName: table,
    ReturnValues: "ALL_OLD",
  };
  return (await documentClient.putItem(params).promise()).Attributes;
};

const updateList = async (table, list) => {
  const returnValues = [];
  const loopVales = [];
  while (list.length) {
    const values = list.splice(0, 25);
    loopVales.push(values);
  }
  await Promise.all(
    loopVales.map(async (value) => {
      try {
        const params = {
          RequestItems: {
            [table]: value.map((v) => {
              return {
                PutRequest: {
                  Item: v,
                },
              };
            }),
          },
        };
        returnValues.push(await documentClient.batchWrite(params).promise());
      } catch (e) {}
    })
  );

  return returnValues;
};

exports.putSingle = updateItem;
exports.putMultiple = updateList;
