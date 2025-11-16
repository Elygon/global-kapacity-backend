const mongoose = require('mongoose')

const customerSupportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    sender: { type: String, enum: ['user', 'system'] },
    message: {type: String, required: true}
}, {timestamps: true, collection: 'customer_supports'})

const model = mongoose.model('CustomerSupport', customerSupportSchema)
module.exports = model