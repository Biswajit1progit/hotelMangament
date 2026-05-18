 const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "biswajitsahookalia@gmail.com",
    pass: "osknzfgjzqplpxyb",

  },
});

module.exports = transporter;