const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-1'
});

exports.registerImage = async (event) => {
  const others = require('./others');

  const data = JSON.parse(event.body).data;
  const userId = data.userId;

  const isLoggedIn = others.isLoggedIn(event, userId);
  if (isLoggedIn === 'authorizationError') {
    const response = {
      statusCode: 401,
      body: JSON.stringify('Authorization Error!!'),
      headers: {
        'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
        'Access-Control-Allow-Credentials': true
      }
    };
    return response;
  } else if (isLoggedIn === 'expired') {
    const response = {
      statusCode: 302,
      headers: {
        'Location': 'https://api.peacebox.shinbunbun.info/authorize?type=logIn',
        'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
    return response;
  }

  console.log(data);
  const questionId = data.questionId;
  const image = data.image.replace(/^data:\w+\/\w+;base64,/, '');
  const decodedImage = Buffer.from(image, 'base64');

  const params = {
    Body: decodedImage,
    Bucket: 'peacebox-images',
    Key: [questionId, 'jpeg'].join('.'),
    ContentType: 'image/jpeg'
  };

  const s3 = new AWS.S3();
  await s3.putObject(params).promise()
    .then(() => {
      console.log('Success!!!');
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
    });

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://peacebox.shinbunbun.info',
      'Access-Control-Allow-Credentials': true
      // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    body: JSON.stringify({
      imageUrl: `https://peacebox-images.s3-ap-northeast-1.amazonaws.com/${questionId}.jpeg`
    })
  };
  return response;
};