const twilio = require("twilio")
require('dotenv').config()

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILLO_AUTH_TOKEN
);

module.exports = client