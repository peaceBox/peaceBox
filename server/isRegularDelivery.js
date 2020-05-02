const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.isRegularDelivery = async (event) => {
  const others = require('./others');
  const data = JSON.parse(event.body).data;
  const isRegularDelivery = data.isRegularDelivery; //
  const userId = data.userId;

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
        'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info'
      },
      body: ''
    };
    return response;
  }

  const param = {
    TableName: 'peaceBoxUserTable',
    Key: { // 更新したい項目をプライマリキー(及びソートキー)によって１つ指定
      userId: userId
    },
    ExpressionAttributeNames: {
      '#r': 'isRegularDelivery',
    },
    ExpressionAttributeValues: {
      ':isRegularDelivery': isRegularDelivery
    },
    UpdateExpression: 'SET #r = :isRegularDelivery'
  };
  await new Promise((resolve, reject) => {
    dynamoDocument.update(param, (err, data) => {
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
  const response = {
    statusCode: 302,
    headers: {
      'Location': 'https://peacebox.shinbunbun.info',
      'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info'
    },
    body: ''
  };
  return response;
};