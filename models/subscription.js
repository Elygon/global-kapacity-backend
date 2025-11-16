const mongoose = require('mongoose')

const subscribeSchema = new mongoose.Schema({
    user_id: String,
    organization_id: String,
    name: String,
    description: String,

    // user or organization
    plan_type: {
        type: String,
        enum: ['user', 'organization']
    },

    // pricing object for different billing cycles
    pricing: {
        monthly: Number,
        quarterly: Number,
        yearly: Number
    },
    features: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean, default: true
    }
}, { timestamps: true, collection: 'subscriptions' })

const model = mongoose.model('Subscription', subscribeSchema)
module.exports = model