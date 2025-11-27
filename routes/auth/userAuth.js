const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')

const User = require('../../models/user')
const { sendOtpEmail } = require("../../utils/nodemailer")
const { createOtp } = require('../../services/otp_service')

const VALID_CHANNELS = ['email', 'sms', 'whatsapp']



// Stage One - Collect info & send OTP
router.post("/signup_stage_one", async (req, res) => {
  const { firstname, lastname, email, phone_no, password, otp_channel } = req.body

  if (!firstname || !lastname || !email || !phone_no || !password || !otp_channel) {
    return res.status(400).send({ status: "error", msg: "All fields are required" })
  }

  if (!VALID_CHANNELS.includes(otp_channel.toLowerCase())) {
    return res.status(400).send({ status: "error", msg: "Invalid OTP channel" })
  }

  try {
    // Check duplicate email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] })
    if (existingUser) {
      return res.status(400).send({ status: "error", msg: "Email or phone already exists" })
    }

    // Save signup data in payload
    const payload = { firstname, lastname, email, phone_no, password } // for user

    // Create a temporary ObjectId for OTP owner
    const tempUserId = new mongoose.Types.ObjectId()

    // Generate and store OTP in DB
    const otpRecord = await createOtp(tempUserId, 'user', 'verify_account', 15, payload)

    // Send OTP via email (or other channels)
    await sendOtpEmail(email, firstname, otpRecord.code, 15)


    return res.status(200).send({ status: "ok", msg: 'success', channel: otp_channel })

  } catch (error) {
    return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
  }
})


module.exports = router