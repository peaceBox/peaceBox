const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.screenNameToUserId = async (screenName) => {
  // console.log(screenName);
  const param = {
    TableName: 'peaceBoxUserTable',
    IndexName: 'screenName-index',
    KeyConditionExpression: '#k = :val',
    ExpressionAttributeValues: {
      ':val': screenName
    },
    ExpressionAttributeNames: {
      '#k': 'screenName'
    }
  };
  const promise = await new Promise((resolve, reject) => {
    dynamoDocument.query(param, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  const userId = promise.Items[0].userId;
  // console.log(userId);
  return userId;
};