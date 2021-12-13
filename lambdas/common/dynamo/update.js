const AWS = require("aws-sdk");
var documentClient = new AWS.DynamoDB.DocumentClient();

const getLetters = (num) => {
  let numRepeats = Math.ceil(num / 26);
  return [...Array(numRepeats).keys()]
    .map((a) =>
      [...Array(26).keys()].map((b) =>
        String.fromCharCode(b + 65).repeat(a + 1)
      )
    )
    .flat()
    .slice(0, num);
};
const getGeneralParams = (tableName, keyFieldName, obj) => {
  const keyVal = obj[keyFieldName];
  delete obj[keyFieldName];
  const letters = getLetters(Object.keys(obj).length);
  let expression = `SET ${Object.keys(obj)
    .map((k, i) => `#${letters[i]} = :${letters[i]} `)
    .join(", ")}`;

  var ExpressionAttributeNames = {};
  Object.keys(obj).forEach((k, i) => {
    ExpressionAttributeNames[`#${letters[i]}`] = k;
  });
  var ExpressionAttributeValues = {};
  Object.keys(obj).forEach((k, i) => {
    ExpressionAttributeValues[`:${letters[i]}`] = obj[k];
  });

  return {
    TableName: tableName,
    ExpressionAttributeValues,
    Key: { [keyFieldName]: keyVal },
    UpdateExpression: expression,
    ExpressionAttributeNames,
    ReturnValues: "ALL_NEW",
  };
};

const update = async (table, keyFieldName, obj) => {
  if (Array.isArray(obj)) {
    const retObjs = [];
    await Promise.all(
      obj.map(async (id) => {
        const params = getGeneralParams(table, keyFieldName, id);
        retObjs.push(
          (await documentClient.update(params).promise()).Attributes
        );
      })
    );
    return retObjs;
  } else {
    const params = getGeneralParams(table, keyFieldName, obj);
    return (await documentClient.update(params).promise()).Attributes;
  }
};

exports.update = update;
