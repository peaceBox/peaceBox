const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.getAllQuestion = async (event) => {
  const others = require('./others');

  const params = event.queryStringParameters;
  const questionerUserId = params.questionerUserId;
  const userId = params.questionerUserId;

  const isLoggedIn = others.isLoggedIn(event, userId);
  if (isLoggedIn === 'authorizationError') {
    const response = {
      statusCode: 401,
      body: JSON.stringify('Authorization Error!!')
    };
    return response;
  } else if (isLoggedIn === 'expired') {
    const response = {
      statusCode: 302,
      headers: {
        'Location': 'https://api.peacebox.shinbunbun.info/authorize?type=logIn',
        'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
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
      'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify('success')
  };
  return response;
};