const mongoose = require('mongoose')

const trainingSchema = new mongoose.Schema({
    training_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainings'},
    user_id: String,
    organization_id: String,

    // basic info
    firstname: String,
    lastname: String,
    email: String,
    phone_no: String,

    // only for hybrid trainings
    attendance_mode: {
        type: String, enum: [ 'Virtual', 'In-Person']
    },

    // only used for paid events
    attendance_type: String,
    amount_paid: Number,
    payment_status: {
        type: String, enum: [ 'paid', 'pending', 'not_required'], default: 'not_required'
    },

    // optional stored payment information for paid event
    payment_details: {
        card_last_four: String,
        expiry_month: Number,
        expiry_year: Number,
        transaction_id: String 
    }
}, { timestamps: true, collection: 'trainings' })

const model = mongoose.model('Trainings', trainingSchema)
module.exports = model