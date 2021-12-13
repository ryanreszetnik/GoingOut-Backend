const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
var lambda = new AWS.Lambda();

const sendWebsocket = async (request) => {
  var websocketParams = {
    FunctionName: "going-out-send-websocket",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify(request),
  };
  return await lambda.invoke(websocketParams).promise();
};

exports.handler = async (event) => {
  // TODO implement

  const accessToken = event["queryStringParameters"]["token"];

  var cognitoParams = {
    AccessToken: accessToken,
  };
  let user;
  try {
    user = await cognitoIdentityServiceProvider
      .getUser(cognitoParams)
      .promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err),
    };
  }

  const sub = user.UserAttributes.find((ob) => ob.Name === "sub").Value;
  await sendWebsocket({
    subs: [sub],
    action: "checkConnection",
    payload: null,
  });

  const connectionId = event.requestContext.connectionId;

  var params = {
    TableName: "going-out-connections",
    Item: { connectionId: { S: connectionId }, sub: { S: sub } },
  };
  await dynamo.putItem(params).promise();

  var params2 = {
    ExpressionAttributeNames: {
      "#G": "currentConnections",
    },
    ExpressionAttributeValues: {
      ":g": {
        SS: [connectionId],
      },
    },
    Key: {
      sub: { S: sub },
    },
    ReturnValues: "ALL_NEW",
    TableName: "going-out-users",
    UpdateExpression: "ADD #G :g",
  };

  try {
    await dynamo.updateItem(params2).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: "Failed to connect: " + JSON.stringify(err),
    };
  }

  return { statusCode: 200, body: "Connected." };
};
