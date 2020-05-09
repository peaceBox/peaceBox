const nodemailer = require('nodemailer');

module.exports.test = async (event) => {
  console.log(1);
  const smtpConfig = nodemailer.createTransport({
    service: 'gmail',
    port: 46,
    secure: true,
    auth: {
      user: process.env.mail,
      pass: process.env.pass
    }
  });

  const message = {
    from: process.env.mail,
    to: 'takamuneyuto@gmail.com',
    subject: 'テストです',
    text: 'サンプルメール送ってみたよ',
  };

  await new Promise((resolve, reject) => {
    smtpConfig.sendMail(message, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    });
  });

};