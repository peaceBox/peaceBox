module.exports.hello = async (event) => {
    // パスを取得
    const path = event.path;
    const method = event.httpMethod;
    const host = event.headers.Host;
    const cors = (host === 'api.peacebox.sugokunaritai.dev') ? 'https://peacebox.sugokunaritai.dev' : 'http://localhost:8080';
    // レスポンスを定義
    let res;
    // パスによって条件分岐
    switch (path) {
        case '/authorize':
            switch (method) {
                case 'GET':
                    res = await require('./authorize/authorize-get').main(event);
                    break;
            }
            break;
        case '/callback':
            switch (method) {
                case 'GET':
                    res = await require('./callback/callback-get').main(event);
                    break;
            }
            break;
        case '/account':
            switch (method) {
                case 'DELETE':
                    res = await require('./account/account-delete').main(event);
                    break;
            }
            break;
        case '/answer':
            switch (method) {
                case 'POST':
                    res = await require('./answer/answer-post').main(event);
                    break;
            }
            break;
        case '/question':
            switch (method) {
                case 'GET':
                    res = await require('./question/question-get').main(event);
                    break;
                case 'POST':
                    res = await require('./question/question-post').main(event);
                    break;
            }
            break;
        case '/regularTweet':
            switch (method) {
                case 'POST':
                    res = await require('./regularTweet/regularTweet-post').main(event);
                    break;
            }
            break;
    }

    console.log(res);

    if (res['headers']['Access-Control-Allow-Origin']) {
        res['headers']['Access-Control-Allow-Origin'] = cors;
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