module.exports.hello = async (event) => {
    const authorizeFunc = require('./authorize');
    const callbackFunc = require('./callback');
    const isRegularDeliveryFunc = require('./isRegularDelivery');
    // パスを取得
    const path = event.path;
    // レスポンスを定義
    let res;
    // パスによって条件分岐
    switch (path) {
        case '/authorize':
            res = await authorizeFunc.authorize(event);
            break;
        case '/callback':
            res = await callbackFunc.callback(event);
            break;
        case '/isRegularDelivery':
            res = await isRegularDeliveryFunc.isRegularDelivery(event);
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

/* const isLoggedIn = async (event, userId) => {
    const cookie = event.headers.cookie.split('; ');
    for (const property in cookie) {
        if (cookie.hasOwnProperty(property)) {
            if ((cookie[property]).indexOf('accessToken') != -1) {
                accessToken = cookie[property].slice(12);
            }
        }
    }

    const param = {
        TableName: 'peaceBoxUserTable',
        KeyConditionExpression: '#k = :val',
        ExpressionAttributeValues: {
            ':val': userId
        },
        ExpressionAttributeNames: {
            '#k': 'userId'
        }
    };
    const userData = await new Promise((resolve, reject) => {
        dynamoDocument.query(param, (err, data) => {
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
    const registeredAccessToken = userData.Items[0].accessToken;
    const accessTokenTTL = userData.Items[0].accessTokenTTL;
    const date = new Date();
    const timestamp = date.getTime();
    if (registeredAccessToken !== accessToken) {
        return 'authorizationError';
    }
    if (accessTokenTTL < timestamp) {
        return 'expired';
    }
    return 'loggedIn';
};*/

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