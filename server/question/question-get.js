const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.main = async (event) => {
  // const others = require('../others');

  const params = event.queryStringParameters;
  const questionId = params.questionId;
  const option = params.option;

  if (option === 'all') {
    const res = await require('./getAllQuestion').main(event);
    return res;
  }

  /* const isLoggedIn = others.isLoggedIn(event, userId);
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
        'Location': 'https://api.peacebox.sugokunaritai.dev/authorize?type=logIn',
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };
    return response;
  }*/

  const param = {
    TableName: 'peaceBoxQuestionTable',
    KeyConditionExpression: '#k = :val',
    ExpressionAttributeValues: {
      ':val': questionId
    },
    ExpressionAttributeNames: {
      '#k': 'questionId'
    }
  };
  const promise = await new Promise((resolve, reject) => {
    dynamoDocument.query(param, (err, data) => {
      if (err) {
        reject(err);
        const response = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: ''
        };
        return response;
      } else {
        resolve(data);
      }
    });
  });
  const data = promise.Items[0];

  const question = data.question;
  const answer = data.answer;
  const questionerScreenName = data.questionerScreenName;
  const answererScreenName = data.answererScreenName;

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      answer: answer,
      questionerScreenName: questionerScreenName,
      answererScreenName: answererScreenName,
      question: question
    })
  };
  return response;
};