const AWS = require('aws-sdk');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

const callback = 'https://api.peacebox.shinbunbun.info';

exports.postQuestion = async (event) => {
  const others = require('./others');
  const data = JSON.parse(event.body).data;
  const userId = data.userId;

  const isLoggedIn = others.isLoggedIn(event, userId);
  if (isLoggedIn === 'authorizationError') {
    const response = {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify('Authorization Error!!')
    };
    return response;
  } else if (isLoggedIn === 'expired') {
    const response = {
      statusCode: 302,
      headers: {
        'Location': 'https://api.peacebox.shinbunbun.info/authorize',
        'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
    return response;
  }

  const dt = new Date();

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

  const tokenData = tokenResponse.data;
  const dataSplitted = tokenData.split('&');
  const oauthToken = dataSplitted[0].split('=')[1];

  const param = {
    TableName: 'peaceBoxTemporaryTable',
    Item: {
      oauthToken: oauthToken,
      questionerUserId: data.questionerUserId,
      question: data.question,
      TTL: dt.setMinutes(dt.getMinutes() + 10).getTime()
    }
  };
  await new Promise((resolve, reject) => {
    dynamoDocument.put(param, (err, data) => {
      if (err) {
        console.error(err);
        const response = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
            'Access-Control-Allow-Credentials': true
          },
          body: ''
        };
        return response;
        // reject(err);
      } else {
        resolve(data);
      }
    });
  });

  const response = {
    statusCode: 302,
    body: '',
    headers: {
      'Location': `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`,
      'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
      'Access-Control-Allow-Credentials': true
    },
    multiValueHeaders: {
      'Set-Cookie': [`oauth_token=${oauthToken}; HttpOnly; Secure`, 'type=postQuestion; HttpOnly; Secure']
    }
  };
  return response;
};