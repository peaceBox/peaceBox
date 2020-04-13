const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.isRegularDelivery = async (event) => {
  const data = JSON.parse(event.body).data;
  const isRegularDelivery = data.isRegularDelivery;
  const userId = data.userId;

  const isLoggedIn = isLoggedIn(event, userId);
  if (isLoggedIn === 'authorizationError') {
    const response = {
      statusCode: 401,
      body: JSON.stringify('Authorization Error!!')
    };
    return response;
  } else if (isLoggedIn === 'expired') {
    const response = authorizeFunc();
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
    statusCode: 200,
    body: JSON.stringify('success')
  };
  return response;
};