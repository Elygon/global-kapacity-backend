require("dotenv").config();
const client = require("../services/otp_service");  // Twilio client instance

// Send WhatsApp OTP
const sendWhatsappOtp = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio WhatsApp Sandbox Number
      to: `whatsapp:${phoneNumber}`,
      body: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
    });

    return message.sid;
  } catch (error) {
    console.error("Error sending WhatsApp OTP:", error.message);
    throw error;
  }
};

// Send SMS OTP
const sendSmsOtp = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio SMS-enabled number
      to: phoneNumber,
      body: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
    });

    return message.sid;
  } catch (error) {
    console.error("Error sending SMS OTP:", error.message);
    throw error;
  }
};

module.exports = { sendWhatsappOtp, sendSmsOtp }