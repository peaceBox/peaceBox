exports.loggedIn = async (event) => {
  const others = require('./others');

  const data = JSON.parse(event.body).data;
  const userId = data.userId;

  const isLoggedIn = await others.isLoggedIn(event, userId);
  if (isLoggedIn === 'authorizationError') {
    const response = {
      statusCode: 401,
      body: JSON.stringify('Authorization Error!!'),
      headers: {
        'Access-Control-Allow-Origin': 'https://peacebox.sugokunaritai.dev',
        'Access-Control-Allow-Credentials': true
      }
    };
    return response;
  } else if (isLoggedIn === 'expired') {
    const response = {
      statusCode: 302,
      headers: {
        'Location': 'https://api.peacebox.sugokunaritai.dev/authorize?type=logIn',
        'Access-Control-Allow-Origin': 'https://peacebox.sugokunaritai.dev',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
    return response;
  }

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://peacebox.sugokunaritai.dev',
      'Access-Control-Allow-Credentials': true
      // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    body: ''
  };
  return response;
};