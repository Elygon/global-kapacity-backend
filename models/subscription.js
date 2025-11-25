const mongoose = require('mongoose')

const subscribeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

    // freemium or premium
    sub_type: {
        type: String, enum: ['freemium','premium'], default: 'freemium'
    },
    // user or organization
    account_type: {
        type: String,
        enum: ['user', 'organization']
    },

    // pricing object for different billing cycles
    sub_cycle: { type: String, enum: ['monthly', 'quarterly', 'yearly', null], default: null
    },
    sub_expires: { type: Date, default: null},
    is_premiumActive: { type: Boolean, default: false },
    amount: Number,
    transaction_ref: String
}, { timestamps: true, collection: 'subscriptions' })

const model = mongoose.model('Subscription', subscribeSchema)
module.exports = model