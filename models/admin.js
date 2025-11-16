const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    role: String,
    firstname: String,
    lastname: String,
    email: String,
    phone_no: String,
    password: String,
    profile_img_id: { type: String, default: '' },
    profile_img_url: { type: String, default: '' },
    gender: String,
    date_of_birth: String,
    address: String,
    is_online: {type: Boolean, default: true},
    last_logout: {type: Number, default: null},
    last_login: {type: Number, default: null},
    is_blocked: {type: Boolean, default: false}, // set when admin is blocked
    block_reason: { type: String, default: '' },
    is_banned: { type: Boolean, default: false },
    ban_reason: {type: String, default: ''},    // reasons why this admin was banned
    is_deleted: {type: Boolean, default: false}, // set when admin account is deleted
    delete_reason: {
        type: String,
        default: null} //Reason provided why this admin account was deleted
}, { timestamps: true, collection: 'admins' })

const model = mongoose.model('Admin', adminSchema)
module.exports = model