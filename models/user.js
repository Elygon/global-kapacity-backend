const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    role: { type: String, default: 'user' },
    firstname: String,
    lastname: String,
    email: String, 
    phone_no: String,
    password: String,
    twoFAPin: String, // 2FA PIN
    authProvider: {
        type: String,
        enum: ['email', 'google', 'apple'],
        default: 'email' // default is normal signup
    },

    // for subscription plans
    is_premium_user: { type: Boolean, default: false },
    sub_plan: { type: String, enum: ['none', 'monthly', 'quarterly', 'yearly'], default: 'none' },
    expiry_date: { type: Date, default: null },
    
    // for user's account status
    is_online:{type: Boolean, default: false },
    is_deleted: {type: Boolean, default: false},
    last_login: Number,
    last_logout: Number, 
    status: {type: String, enum: ["Active", "Suspended", "Deactivated"], default: "Active"},//Status can be 'Active', 'Suspended' or 'Deleted'
    is_verified: { type: Boolean, default: true },
    is_kip: { type: Boolean, default: false },
    is_blocked: { type: Boolean, default: false },
    block_reason: {type: String, default: ''},
    is_banned: { type: Boolean, default: false },
    ban_reason: {type: String, default: ''},
    deletionReason: {
        type: String,
        default: null //Reason provided by the admin when the account is deleted
    }
}, { timestamps: true, collection: 'users'})

const model = mongoose.model('User', userSchema)
module.exports = model