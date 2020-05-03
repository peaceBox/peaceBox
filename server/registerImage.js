const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-1'
});

exports.registerImage = async (event) => {
  const data = JSON.parse(event.body).data;
  const questionId = data.questionId;
  const image = data.image.replace(/^data:\w+\/\w+;base64,/, '');
  const decodedImage = new Buffer(image, 'base64');

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
    body: JSON.stringify('success')
  };
  return response;
};