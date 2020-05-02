const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.isLoggedIn = async (event, userId) => {
  const cookie = event.headers.cookie.split('; ');
  let accessToken;
  for (const property in cookie) {
    if (cookie.hasOwnProperty(property)) {
      if ((cookie[property]).indexOf('accessToken') != -1) {
        accessToken = cookie[property].slice(12);
      }
    }
  }

  const param = {
    TableName: 'peaceBoxUserTable',
    KeyConditionExpression: '#k = :val',
    ExpressionAttributeValues: {
      ':val': userId
    },
    ExpressionAttributeNames: {
      '#k': 'userId'
    }
  };
  const userData = await new Promise((resolve, reject) => {
    dynamoDocument.query(param, (err, data) => {
      if (err) {
        reject(err);
        const response = {
          statusCode: 500,
          body: ''
        };
        return response;
      } else {
        resolve(data);
      }
    });
  });
  const registeredAccessToken = userData.Items[0].accessToken;
  const accessTokenTTL = userData.Items[0].accessTokenTTL;
  const date = new Date();
  const timestamp = date.getTime();
  if (registeredAccessToken !== accessToken) {
    return 'authorizationError';
  }
  if (accessTokenTTL < timestamp) {
    return 'expired';
  }
  return 'loggedIn';
};