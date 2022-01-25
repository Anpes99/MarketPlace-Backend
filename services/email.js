require("dotenv").config();

("use strict");
const nodemailer = require("nodemailer");

async function sendEmail(receivers, subject, text) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: `"MarketPlace" ${process.env.EMAIL}`,
    to: receivers,
    subject: subject,
    text: text, // plain text body
    //html: "<b><h1>Hello world?</h1></b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}
module.exports = { sendEmail };
