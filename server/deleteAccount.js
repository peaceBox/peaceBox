const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.deleteAccount = async (event) => {
  const params = event.queryStringParameters;
  const userId = params.userId;

  const others = require('./others');

  const isLoggedIn = others.isLoggedIn(event, userId);
  if (isLoggedIn === 'authorizationError' || isLoggedIn === 'expired') {
    const response = {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify('Authorization Error!!')
    };
    return response;
  }

  const peaceBoxUserTableParam = {
    TableName: 'peaceBoxUserTable',
    Key: {
      ID: userId
    }
  };
  await new Promise((resolve, reject) => {
    dynamoDocument.delete(peaceBoxUserTableParam, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  const peaceBoxQuestionTableParam = {
    TableName: 'peaceBoxQuestionTable',
    IndexName: 'answererUserId-index',
    KeyConditionExpression: '#k = :val',
    ExpressionAttributeValues: {
      ':val': userId
    },
    ExpressionAttributeNames: {
      '#k': 'answererUserId'
    }
  };
  await new Promise((resolve, reject) => {
    dynamoDocument.delete(peaceBoxQuestionTableParam, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  };
  return response;
};