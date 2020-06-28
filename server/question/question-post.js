const AWS = require('aws-sdk');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();


exports.main = async (event) => {
  const others = require('../others');
  const data = JSON.parse(event.body);
  const questionerUserId = data.questionerUserId;
  const answererUserId = data.answererUserId;

  const host = event.headers.Host;
  const callback = (host === 'api.peacebox.sugokunaritai.dev') ? 'https://api.peacebox.sugokunaritai.dev/callback' : 'https://api.dev.peacebox.sugokunaritai.dev/callback';

  const isLoggedIn = others.isLoggedIn(event, questionerUserId);
  if (isLoggedIn === 'authorizationError') {
    const response = {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify('Authorization Error!!')
    };
    return response;
  } else if (isLoggedIn === 'expired') {
    const response = {
      statusCode: 302,
      headers: {
        'Location': 'https://api.peacebox.sugokunaritai.dev/authorize',
        'Access-Control-Allow-Origin': '*',
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
      'oauth_callback': `${callback}`
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
      questionerUserId: questionerUserId,
      answererUserId: answererUserId,
      question: data.question,
      TTL: dt.setMinutes(dt.getMinutes() + 10)
    }
  };
  await new Promise((resolve, reject) => {
    dynamoDocument.put(param, (err, data) => {
      if (err) {
        console.error(err);
        const response = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
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


  const image = data.image.replace(/^data:\w+\/\w+;base64,/, '');
  const decodedImage = Buffer.from(image, 'base64');

  const params = {
    Body: decodedImage,
    Bucket: 'peacebox-temporary-images',
    Key: [oauthToken, 'jpeg'].join('.'),
    ContentType: 'image/jpeg'
  };

  const s3 = new AWS.S3();
  await new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        console.log('error : ', err);
        reject(err);
      } else {
        console.log('success');
        resolve();
      }
    });
  });

  const response = {
    statusCode: 200,
    body: '',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    multiValueHeaders: {
      'Set-Cookie': [`oauth_token=${oauthToken}; HttpOnly; Secure`, 'type=postQuestion; HttpOnly; Secure']
    },
    body: JSON.stringify({
      location: `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`
    })
  };
  return response;
};