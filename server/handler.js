module.exports.hello = async (event) => {
    const authorizeFunc = require('./authorize');
    const callbackFunc = require('./callback');
    const isRegularDeliveryFunc = require('./isRegularDelivery');
    const getAllQuestionFunc = require('./getAllQuestion');
    const registerQuestionFunc = require('./registerQuestion');
    const getQuestionFunc = require('./getQuestion');
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
            res = await registerQuestionFunc.registerQuestion(event);
            break;
        case '/getAllQuestion':
            res = await getAllQuestionFunc.getAllQuestion(event);
            break;
        case '/getQuestion':
            res = await getQuestionFunc.getQuestion(event);
            break;
    }

    return res;
};
/*
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
};*/