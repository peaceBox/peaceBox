const nodemailer = require('nodemailer');

module.exports.sendMail = async (event, messageText, subject, to) => {
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
    to: to,
    subject: subject,
    text: messageText,
  };

  await new Promise((resolve, reject) => {
    smtpConfig.sendMail(message, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
};