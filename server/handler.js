// const oauthSignature = require('oauth-signature');
// const uuidv4 = require('uuid/v4');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const callback = 'https://auypdqzjyi.execute-api.ap-northeast-1.amazonaws.com/prod';

exports.handler = async (event) => {

    // const nonce = uuidv4();

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
            'oauth_callback': `${callback}/oauth`
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
        body: JSON.stringify('Hello from Lambda!'),
        headers: {
            Location: `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`
        }
    };
    return response;
};