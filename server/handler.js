// const oauthSignature = require('oauth-signature');
// const uuidv4 = require('uuid/v4');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const callback = 'https://auypdqzjyi.execute-api.ap-northeast-1.amazonaws.com/prod';

module.exports.hello = async (event) => {
    // パスを取得
    const path = event.path;
    // レスポンスを定義
    let res;
    // パスによって条件分岐
    switch (path) {
        case '/authorize':
            // authorizeFuncを呼び出し
            res = await authorizeFunc();
            break;
        case '/callback':
            // callbackFuncを呼び出し
            res = await callbackFunc(event);
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

const callbackFunc = (event) => {
    console.log(event);
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!')
    };
    return response;
};