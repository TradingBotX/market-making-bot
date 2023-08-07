const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});
var mails = {};
mails.send = async function (
  to,
  subject,
  html,
  attachments,
  text = "",
  from = "Indsoft Node Monitor Alert " + process.env.MAIL_FROM
) {
  var info = await transporter
    .sendMail({
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
      attachments: attachments,
    })
    .catch(function (err) {
      console.log("sending_mail_error", to, subject, err);
      throw err;
    });

  console.log("sending_mail_response", to, subject, info);
  return info;
};

module.exports = mails;
global.mail = mails;
