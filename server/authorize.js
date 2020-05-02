const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
// const AWS = require('aws-sdk');
// const dynamoDocument = new AWS.DynamoDB.DocumentClient();

const callback = 'https://api.peacebox.shinbunbun.info';

exports.authorize = async (event) => {
  /* const dt = new Date();

  const params = event.queryStringParameters;*/

  /* const type = params.type;
  if (!type) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        status: 'invalid params'
      }),
    };
    return response;
  }*/

  // eslint-disable-next-line new-cap
  const oauth = OAuth({
    consumer: {
      key: process.env.consumer_key,
      secret: process.env.consumer_secret
    },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString, key) {
      return crypto.createHmac('sha1', key).update(baseString).digest('base64');
    }
  });

  const requestData = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    data: {
      'oauth_callback': `${callback}/callback`
    }
  };

  const authData = oauth.authorize(requestData);
  requestData.headers = oauth.toHeader(authData);

  // console.log(requestData);

  const tokenResponse = await axios(requestData).catch((e) => {
    throw new Error({
      status: e.response.status
    });
  });

  console.log(tokenResponse.data);
  const data = tokenResponse.data;
  const dataSplitted = data.split('&');
  const oauthToken = dataSplitted[0].split('=')[1];
  /*
    if (type === 'postQuestion') {
      const param = {
        TableName: 'peaceBoxTemporaryTable',
        Item: {
          oauthToken: oauthToken,
          questionerUserId: params.questionerUserId,
          question: params.question,
          TTL: dt.setMinutes(dt.getMinutes() + 10).getTime()
        }
      };
      await new Promise((resolve, reject) => {
        dynamoDocument.put(param, (err, data) => {
          if (err) {
            console.error(err);
            const response = {
              statusCode: 500,
              body: ''
            };
            return response;
            // reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }

    if (type === 'postAnswer') {
      const param = {
        TableName: 'peaceBoxTemporaryTable',
        Item: {
          oauthToken: oauthToken,
          answererUserId: params.answererUserId,
          answer: params.answer,
          questionId: params.questionId,
          TTL: dt.setMinutes(dt.getMinutes() + 10).getTime()
        }
      };
      await new Promise((resolve, reject) => {
        dynamoDocument.put(param, (err, data) => {
          if (err) {
            console.error(err);
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
    }*/

  const response = {
    statusCode: 302,
    body: '',
    headers: {
      'Location': `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`
    },
    multiValueHeaders: {
      'Set-Cookie': [`oauth_token=${oauthToken}; HttpOnly; Secure`, 'type=logIn; HttpOnly; Secure']
    }
  };
  return response;
};