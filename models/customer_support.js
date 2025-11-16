const mongoose = require('mongoose')

const customerSupportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization_i: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    sender: { type: String, enum: ['user', 'system'] },
    message: {type: String, required: true}
}, {timestamps: true, collection: 'customer_supports'})

const model = mongoose.model('CustomerSupport', customerSupportSchema)
module.exports = model