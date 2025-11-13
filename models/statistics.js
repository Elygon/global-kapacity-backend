const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    no_of_admins: { type: Number, default: 0 },
    no_of_blocked_admins: { type: Number, default: 0 },
    no_of_deleted_admins: { type: Number, deault: 0 },
    no_of_users: { type: Number, default: 0 },
    no_of_blocked_users: { type: Number, default: 0 },
    no_of_banned_users: { type: Number, default: 0 },
    no_of_organizations: { type: Number, default: 0 },
    no_of_blocked_organizations: { type: Number, default: 0 },
    no_of_banned_organizations: { type: Number, default: 0 },
    no_of_reports: { type: Number, default: 0 },
    no_of_customer_support_request: { type: Number, default: 0 },
    total_global_kapacity_earnings: { type: Number, default: 0 },
    account_verification_price: { type: Number, default: 4000 },
    reports_noti: { type: Number, default: 0 },
    help_feedback_noti: { type: Number, default: 0 },
    verification_request_noti: { type: Number, default: 0 }
}, { timestamps: true, collection: 'statistics' })

const model = mongoose.model('Statistics', statsSchema)
module.exports = model