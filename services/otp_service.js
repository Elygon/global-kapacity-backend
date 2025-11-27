const Otp = require('../models/otp')      
const { generateOtp } = require('../helpers/otp')

// Create a new OTP
const createOtp = async (ownerId, ownerType, purpose, expiresInMinutes = 15, payload = {}) => {
    const otpCode = generateOtp()
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    const otp = await Otp.create({
        owner_id: ownerId,
        owner_type: ownerType,
        code: otpCode,
        purpose,
        expires_at: expiresAt,
        payload
    })

    return otp
}

// Validate an OTP
const validateOtp = async (ownerId, ownerType, purpose, providedOtp) => {
    const otp = await Otp.findOne({
        owner_id: ownerId,
        owner_type: ownerType,
        purpose,
        code: providedOtp,
        expires_at: { $gt: new Date() }
    })

    return !!otp
}

// Delete used or expired OTPs
const deleteOtp = async (ownerId, ownerType, purpose) => {
    return await Otp.deleteMany({
        owner_id: ownerId,
        owner_type: ownerType,
        purpose
    })
}

module.exports = { createOtp, validateOtp, deleteOtp }
