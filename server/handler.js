// const oauthSignature = require('oauth-signature');
const uuidv4 = require('uuid/v4');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const dynamoDocument = new AWS.DynamoDB.DocumentClient();
const callback = 'https://api.peacebox.shinbunbun.info';

module.exports.hello = async (event) => {
    // パスを取得
    const path = event.path;
    // レスポンスを定義
    let res;
    // パスによって条件分岐
    switch (path) {
        case '/authorize':
            res = await authorizeFunc();
            break;
        case '/callback':
            res = await callbackFunc(event);
            break;
        case '/registerQuestion':
            res = await registerQuestionFunc(event);
            break;
        case '/getQuestion':
            res = await getQuestionFunc(event);
            break;
    }

    return res;
};

const authorizeFunc = async () => {

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

    const response = {
        statusCode: 302,
        body: '',
        headers: {
            'Location': `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`,
            'Set-Cookie': `oauth_token=${oauthToken};HttpOnly`
        },
    };
    return response;
};

const callbackFunc = async (event) => {
    console.log(event);

    // パラメータを取得
    const params = event.queryStringParameters;

    const oauthToken = params.oauth_token;
    const oauthVerifier = params.oauth_verifier;

    const cookie = event.headers.cookie;
    const cookieOauthToken = cookie.slice(12);

    if (oauthToken !== cookieOauthToken) {
        console.error(`oauthToken: ${oauthToken}, cookieOauthToken: ${cookieOauthToken}`);
        const response = {
            statusCode: 401,
            body: JSON.stringify('Error!!')
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

    const accessToken = uuidv4().toString('base64');

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
        },
        ExpressionAttributeValues: {
            ':userOauthTokenEncrypted': userOauthTokenEncrypted,
            ':oauthTokenSecretEncrypted': oauthTokenSecretEncrypted,
            ':screenName': screenName,
            ':accessToken': accessToken,
        },
        UpdateExpression: 'SET #u = :userOauthTokenEncrypted, #o = :oauthTokenSecretEncrypted, #s = :screenName, #a = :accessToken'
    };
    await new Promise((resolve, reject) => {
        dynamoDocument.update(param, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

    const privateKey = process.env.privateKey.split('<br>').join('\n');
    const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(userOauthTokenEncrypted, 'base64')).toString('utf8');
    console.log(decrypted);

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!')
    };
    return response;
};

const registerQuestionFunc = async (event) => {
    // const question = event.body.question;



    const response = {
        statusCode: 200,
        body: JSON.stringify('success')
    };
    return response;
};

const getQuestionFunc = async (event) => {

    const response = {
        statusCode: 200,
        body: JSON.stringify('success')
    };
    return response;
};