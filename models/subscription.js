const mongoose = require('mongoose')

const subscribeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    account_type: { type: String, enum: ['user', 'organization'], required: true },

    // plan info
    plan: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true }, 

    // status
    is_active: { type: Boolean, default: true },

    // Date tracking
    start_date: Date,
    end_date: Date,
    
    amount: Number,
    transaction_ref: String
}, { timestamps: true, collection: 'subscriptions' })

const model = mongoose.model('Subscription', subscribeSchema)
module.exports = model