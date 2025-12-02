const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', auto: true},
    organization_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Organization', auto: true},
    firstname: String,
    lastname: String,
    company_name: String,
    email: { type: String, required: true },
    phone_no: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN'},
    reference: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending'
    },
    payment_method: {
        type: String,
        enum: ["Bank Transfer", "Cash Payment", "Debit Card", "Online Payment"],
        required: true
    },
    /*description: String,*/
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
    /*event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },*/
    gateway: { 
        type: String, 
        enum: ['Paystack', 'Stripe', 'Flutterwave'],
        default: 'Paystack'
    }
}, {timestamps: true, collection: 'payments'})

const model = mongoose.model('Payment', paymentSchema)
module.exports = model