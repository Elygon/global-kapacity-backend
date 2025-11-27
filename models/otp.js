const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    owner_type: { type: String, enum: ['user', 'organization'], required: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ['verify_account', 'reset_password'], required: true },
    expires_at: { type: Date, required: true },
    payload: { type: Object, required: false }, // <-- Store signup data temporarily
}, { timestamps: true, collection: 'one_time_passwords' })

// TTL index: automatic deletion when expires_at is reached
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })

const model = mongoose.model('Otp', otpSchema)
module.exports = model