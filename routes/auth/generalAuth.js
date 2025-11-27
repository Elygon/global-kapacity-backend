const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../../models/user')
const Organization = require('../../models/organization')
const Statistics = require('../../models/statistics')
const Otp = require('../../models/otp')

const { createOtp, validateOtp, deleteOtp } = require('../../services/otp_service')

/**
 * Stage 2 - Verify OTP & create account (generalized)
 * body: { ownerId, ownerType, otp }
 */
router.post('/verify_account', async (req, res) => {
  try {
    const { ownerId, ownerType, otp } = req.body;

    if (!ownerId || !ownerType || !otp) {
      return res.status(400).send({ status: 'error', msg: 'All fields are required' })
    }

    if (!['user', 'organization'].includes(ownerType)) {
      return res.status(400).send({ status: 'error', msg: 'Invalid owner type' })
    }

    // Validate OTP
    const isValid = await validateOtp(ownerId, ownerType, 'verify_account', otp)
    if (!isValid) return res.status(400).send({ status: 'error', msg: 'Invalid or expired OTP' })

    // Fetch the OTP entry to get the payload
    const otpEntry = await Otp.findOne({
      owner_id: ownerId,
      owner_type: ownerType,
      purpose: 'verify_account',
      code: otp,
    })

    if (!otpEntry || !otpEntry.payload) {
      return res.status(400).send({ status: 'error', msg: 'No signup data found for this OTP' })
    }

    const payload = otpEntry.payload

    // Hash password
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10)
    }

    // Create account
    const Model = ownerType === 'user' ? User : Organization
    const account = await Model.create(payload)

    // Generate JWT
    const token = jwt.sign({ _id: account._id, email: account.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Clean up OTP
    await deleteOtp(ownerId, ownerType, 'verify_account')

    // Update statistics if needed
    if (ownerType === 'organization') {
      await Statistics.updateOne({}, { $inc: { no_of_organizations: 1 } }, { upsert: true })
    }

    return res.status(200).send({ status: 'ok', msg: 'success', account, token })

  } catch (err) {
    return res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
  }
})

module.exports = router