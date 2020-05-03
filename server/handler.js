module.exports.hello = async (event) => {
    const authorizeFunc = require('./authorize');
    const callbackFunc = require('./callback');
    const isRegularDeliveryFunc = require('./isRegularDelivery');
    const getAllQuestionFunc = require('./getAllQuestion');
    const registerQuestionFunc = require('./registerQuestion');
    const getQuestionFunc = require('./getQuestion');
    const registerImageFunc = require('./registerImage');
    const postQuestionFunc = require('./postQuestion');
    const postAnswerFunc = require('./postAnswer');
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
        case '/iseregulardelivery':
            res = await isRegularDeliveryFunc.isRegularDelivery(event);
            break;
        case '/registerquestion':
            res = await registerQuestionFunc.registerQuestion(event);
            break;
        case '/getallquestion':
            res = await getAllQuestionFunc.getAllQuestion(event);
            break;
        case '/getquestion':
            res = await getQuestionFunc.getQuestion(event);
            break;
        case '/registerimage':
            res = await registerImageFunc.registerImage(event);
            break;
        case '/postquestion':
            res = await postQuestionFunc.postQuestion(event);
            break;
        case '/postanswer':
            res = await postAnswerFunc.postQuestion(event);
            break;
    }

    console.log(res);

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