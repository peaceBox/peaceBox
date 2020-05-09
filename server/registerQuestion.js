const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.registerQuestion = async (event) => {
  const others = require('./others');

  const params = event.queryStringParameters;
  const questionerUserId = params.questionerUserId;

  const isLoggedIn = others.isLoggedIn(event, questionerUserId);
  if (isLoggedIn === 'authorizationError') {
    const response = {
      statusCode: 401,
      body: JSON.stringify('Authorization Error!!'),
      headers: {
        'Access-Control-Allow-Origin': 'https://peacebox.sugokunaritai.dev',
        'Access-Control-Allow-Credentials': true
      }
    };
    return response;
  } else if (isLoggedIn === 'expired') {
    const response = {
      statusCode: 302,
      headers: {
        'Location': 'https://api.peacebox.sugokunaritai.dev/authorize?type=logIn',
        'Access-Control-Allow-Origin': 'https://peacebox.sugokunaritai.dev',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
    return response;
  }


  const param = {
    TableName: 'peaceBoxQuestionTable',
    IndexName: 'questionerUserId-index',
    KeyConditionExpression: '#k = :val',
    ExpressionAttributeValues: {
      ':val': questionerUserId
    },
    ExpressionAttributeNames: {
      '#k': 'questionerUserId-index'
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
  const data = promise.Items;
  console.log(data);

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://peacebox.sugokunaritai.dev',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify('success')
  };
  return response;
};