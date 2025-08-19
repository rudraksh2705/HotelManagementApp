// utils/email.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use host + port + secure
    auth: {
      user: process.env.EMAIL_USERNAME, // your gmail id
      pass: process.env.EMAIL_PASSWORD, // your gmail app password
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: "Your App <yourgmail@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
