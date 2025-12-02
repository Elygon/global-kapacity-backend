const mongoose = require('mongoose')

// Sub-schema: Payment Result (NO CARD INFO)
const paymentResultSchema = new mongoose.Schema({
    status: { type: String, enum: ['success', 'failed', 'pending'] },
    amount: Number,
    currency: String,
    reference: String, // from Paystack/Flutterwave
    channel: String, // card, ussd, bank_transfer, etc
    paid_at: Date
}, { _id: false })

const regSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    training: { type: mongoose.Schema.Types.ObjectId, ref: 'Training', required: true },

    // Basic attendee information
    firstname: String,
    lastname: String,
    email: String,
    phone_no: String,

    // What mode did they choose? (only for Hybrid)
    attendance_mode: { type: String, enum: ['virtual', 'in-person'], default: null },

    // For trainings that have tickets
    attendee_type: { type: String, default: null }, // e.g. "Regular ($19.99)"
    fee: { type: Number, default: 0 },
    currency: { type: String, default: null },

    // Payment metadata (no sensitive card data)
    is_paid: { type: Boolean, default: false },
    payment: paymentResultSchema,

    // Registration origin
    reg_method: { type: String, enum: ['kapacity', 'external'], default: 'kapacity' },

    // For trainings using external registration link
    external_reg_url: { type: String, default: null },

    // Status of this registration
    status: {
        type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending'
    },

    // For virtual trainings (if admin approves → training_link)
    training_link: { type: String, default: null },

    // For custom message after registration
    msg_after_reg: { type: String, maxlength: 150, default: null }

}, { timestamps: true, collection: 'registration' })

module.exports = mongoose.model('Registration', regSchema)