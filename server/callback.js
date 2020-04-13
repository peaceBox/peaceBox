const uuidv4 = require('uuid/v4');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

exports.callback = async (event) => {
  const dt = new Date();
  console.log(event);

  // パラメータを取得
  const params = event.queryStringParameters;

  const oauthToken = params.oauth_token;
  const oauthVerifier = params.oauth_verifier;

  const cookie = event.headers.cookie.split('; ');

  let cookieOauthToken;
  let type;
  for (const property in cookie) {
    if (cookie.hasOwnProperty(property)) {
      if ((cookie[property]).indexOf('oauth_token') != -1) {
        cookieOauthToken = cookie[property].slice(12);
      }
      if ((cookie[property]).indexOf('type') != -1) {
        type = cookie[property].slice(5);
      }
    }
  }

  for (const property in cookie) {
    if (cookie.hasOwnProperty(property)) {
      if ((cookie[property]).indexOf('oauth_token') != -1) {
        cookieOauthToken = cookie[property].slice(12);
      }
      if ((cookie[property]).indexOf('type') != -1) {
        type = cookie[property].slice(5);
      }
    }
  }

  /* if (type !== 'logIn') {
      let id;
      if (type === 'postQuestion') {
          id = params.questionerUserId;
      } else if (type === 'postAnswer') {
          id = params.answererUserId;
      }
      await isLoggedIn(event, id);
  }*/

  if (oauthToken !== cookieOauthToken) {
    console.error(`oauthToken: ${oauthToken}, cookieOauthToken: ${cookieOauthToken}`);
    const response = {
      statusCode: 401,
      body: JSON.stringify('Authorization Error!!')
    };
    return response;
  }

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
    url: 'https://api.twitter.com/oauth/access_token',
    method: 'POST',
    data: {
      'oauth_token': oauthToken,
      'oauth_verifier': oauthVerifier
    }
  };

  const authData = oauth.authorize(requestData);
  requestData.headers = oauth.toHeader(authData);

  const tokenResponse = await axios(requestData).catch((e) => {
    throw new Error(JSON.stringify({
      status: e.response.data
    }));
  });

  console.log(tokenResponse.data);

  const dataArr = tokenResponse.data.split('&');
  const userOauthToken = dataArr[0].slice(12);
  const oauthTokenSecret = dataArr[1].slice(19);
  const userId = dataArr[2].slice(8);
  const screenName = dataArr[3].slice(12);

  console.log(userOauthToken);

  const publicKey = process.env.publicKey.split('<br>').join('\n');
  const userOauthTokenEncrypted = crypto.publicEncrypt(publicKey, Buffer.from(userOauthToken)).toString('base64');
  const oauthTokenSecretEncrypted = crypto.publicEncrypt(publicKey, Buffer.from(oauthTokenSecret)).toString('base64');

  let accessToken;
  try {
    accessToken = crypto.randomBytes(256).toString('base64');
  } catch (ex) {
    console.error(`tokenErr: ${ex}`);
    const response = {
      statusCode: 500,
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
      '#u': 'userOauthTokenEncrypted',
      '#o': 'oauthTokenSecretEncrypted',
      '#s': 'screenName',
      '#a': 'accessToken',
      '#t': 'accessTokenTTL'
    },
    ExpressionAttributeValues: {
      ':userOauthTokenEncrypted': userOauthTokenEncrypted,
      ':oauthTokenSecretEncrypted': oauthTokenSecretEncrypted,
      ':screenName': screenName,
      ':accessToken': accessToken,
      ':accessTokenTTL': dt.setMinutes(dt.getMinutes() + 1440) // .getTime()
    },
    UpdateExpression: 'SET #u = :userOauthTokenEncrypted, #o = :oauthTokenSecretEncrypted, #s = :screenName, #a = :accessToken, #t = :accessTokenTTL'
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

  let peaceBoxTemporaryTableValue;
  if (type !== 'logIn') {
    const peaceBoxTemporaryTableParam = {
      TableName: 'peaceBoxTemporaryTable',
      KeyConditionExpression: '#k = :val',
      ExpressionAttributeValues: {
        ':val': oauthToken
      },
      ExpressionAttributeNames: {
        '#k': 'oauthToken'
      }
    };
    const peaceBoxTemporaryTableValues = await new Promise((resolve, reject) => {
      dynamoDocument.query(peaceBoxTemporaryTableParam, (err, data) => {
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
    peaceBoxTemporaryTableValue = peaceBoxTemporaryTableValues.Items[0];
  }

  if (type === 'postQuestion') {
    const peaceBoxQuestionTableParam = {
      TableName: 'peaceBoxQuestionTable',
      Item: {
        questionId: uuidv4().split('-').join(''),
        questionerUserId: peaceBoxTemporaryTableValue.questionerUserId,
        question: peaceBoxTemporaryTableValue.question,
        registeredDate: dt.getTime()
      }
    };
    await new Promise((resolve, reject) => {
      dynamoDocument.put(peaceBoxQuestionTableParam, (err, data) => {
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
  } else if (type === 'postAnswer') {
    const peaceBoxQuestionTableParam = {
      TableName: 'peaceBoxQuestionTable',
      Key: { // 更新したい項目をプライマリキー(及びソートキー)によって１つ指定
        questionId: peaceBoxTemporaryTableValue.questionId
      },
      ExpressionAttributeNames: {
        '#a': 'answererUserId',
        '#b': 'answer',
        '#c': 'answeredDate'
      },
      ExpressionAttributeValues: {
        ':answererUserId': peaceBoxTemporaryTableValue.answererUserId,
        ':answer': peaceBoxTemporaryTableValue.answer,
        ':answeredDate': peaceBoxTemporaryTableValue.answeredDate
      },
      UpdateExpression: 'SET #a = :answererUserId, #b = :answer, #c = :answeredDate'
    };
    await new Promise((resolve, reject) => {
      dynamoDocument.update(peaceBoxQuestionTableParam, (err, data) => {
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
  }

  if (type !== 'logIn') {
    const param = {
      TableName: 'peaceBoxTemporaryTable',
      Key: {
        oauthToken: oauthToken
      }
    };
    await new Promise((resolve, reject) => {
      dynamoDocument.delete(param, (err, data) => {
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
  }
  /* else {
          const param = {
              TableName: 'peaceBoxUserTable',
              Key: { // 更新したい項目をプライマリキー(及びソートキー)によって１つ指定
                  userId: userId
              },
              ExpressionAttributeNames: {
                  '#a': 'accessToken',
                  '#t': 'accessTokenTTL'
              },
              ExpressionAttributeValues: {
                  ':accessToken': accessToken,
                  ':accessTokenTTL': dt.setMinutes(dt.getMinutes() + 1440).getTime()
              },
              UpdateExpression: 'SET #a = :accessToken, #t = :accessTokenTTL'
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
      }*/

  /*
  const privateKey = process.env.privateKey.split('<br>').join('\n');
  const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(userOauthTokenEncrypted, 'base64')).toString('utf8');
  console.log(decrypted);*/

  const response = {
    statusCode: 302,
    headers: {
      'Location': `https://peacebox.shinbunbun.info?userId=${userId}&screenName=${screenName}`,
      // 'Location': 'http://takanawa2019.shinbunbun.info',
      // 'Set-Cookie': `accessToken=${accessToken}; HttpOnly; max-age=86400`
      'Set-Cookie': `accessToken=${accessToken}; HttpOnly; Secure; max-age=86400; domain=peacebox.shinbunbun.info`
    },
    multiValueHeaders: {
      'Set-Cookie': [
        'oauth_token=0; max-age=0',
        'type=0; max-age=0',
        `accessToken=${accessToken}; HttpOnly; Secure; max-age=86400; domain=peacebox.shinbunbun.info`,
        `userId=${userId}; Secure; max-age=86400; domain=peacebox.shinbunbun.info`,
        `screenName=${screenName}; Secure; max-age=86400; domain=peacebox.shinbunbun.info`
      ]
    },
    body: ''
  };
  return response;
};