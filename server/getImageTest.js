const AWS = require('aws-sdk');

module.exports.test = async (event) => {
  const s3 = new AWS.S3();

  const getParams = {
    Bucket: 'peacebox-images',
    Key: ['test', 'jpeg'].join('.')
  };

  const image = await (() => {
    return new Promise((resolve, reject) => {
      s3.getObject(getParams, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          return reject(err);
        } else {
          const object = data.Body;
          console.log(object);
          return resolve(object);
        }
      });
    });
  })();

  console.log(image);
};