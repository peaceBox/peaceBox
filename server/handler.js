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
            res = await authorizeFunc(event);
            break;
        case '/callback':
            res = await callbackFunc(event);
            break;
        case '/isRegularDelivery':
            res = await isRegularDeliveryFunc(event);
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

const authorizeFunc = async (event) => {
    const dt = new Date();

    const params = event.queryStringParameters;

    const type = params.type;
    if (!type) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({
                status: 'invalid params'
            }),
        };
        return response;
    }
    /*
        switch (type) {
            case 'login':
                res = await loginFunc(event);
                break;
            case 'postQuestion':
                res = await postQuestionFunc(event);
                break;
            case 'postAnswer':
                res = await postAnswerFunc(event);
                break;
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
    }

    const response = {
        statusCode: 302,
        body: '',
        headers: {
            'Location': `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`
        },
        multiValueHeaders: {
            'Set-Cookie': [`oauth_token=${oauthToken}; HttpOnly; Secure`, `type=${type};HttpOnly; Secure`]
        }
    };
    return response;
};

const callbackFunc = async (event) => {
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

    let accessToken;
    if (type !== 'logIn') {
        let id;
        if (type === 'postQuestion') {
            id = params.questionerUserId;
        } else if (type === 'postAnswer') {
            id = params.answererUserId;
        }
        await isLoggedIn(event, id);
    }

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

    const param = {
        TableName: 'peaceBoxUserTable',
        Key: { // 更新したい項目をプライマリキー(及びソートキー)によって１つ指定
            userId: userId
        },
        ExpressionAttributeNames: {
            '#u': 'userOauthTokenEncrypted',
            '#o': 'oauthTokenSecretEncrypted',
            '#s': 'screenName'
        },
        ExpressionAttributeValues: {
            ':userOauthTokenEncrypted': userOauthTokenEncrypted,
            ':oauthTokenSecretEncrypted': oauthTokenSecretEncrypted,
            ':screenName': screenName,
            ':accessToken': accessToken,
        },
        UpdateExpression: 'SET #u = :userOauthTokenEncrypted, #o = :oauthTokenSecretEncrypted, #s = :screenName'
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
    } else {
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
    }

    /*
    const privateKey = process.env.privateKey.split('<br>').join('\n');
    const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(userOauthTokenEncrypted, 'base64')).toString('utf8');
    console.log(decrypted);*/

    const response = {
        statusCode: 200,
        headers: {
            'Set-Cookie': `accessToken=${accessToken}; HttpOnly; Secure; max-age=86400`
        },
        body: JSON.stringify('Hello from Lambda!')
    };
    return response;
};

const isRegularDeliveryFunc = async (event) => {
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

const isLoggedIn = async (event, userId) => {
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