const mongoose = require('mongoose')

// Subdocument for messages
const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: [ 'User', 'Organization', 'Admin', 'System' ], required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'messages.senderRef', default: null },
    senderRef: { type: String, enum: [ 'User', 'Organization', 'Admin', null ], default: null },
    message: String
}, { timestamps: true })

// Main ticket schema
const ticketSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    /*assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },*/
    messages: [ messageSchema ], // Array of messsages
    status: {
        type: String,
        enum: [ 'Open', 'Pending Admin Response', 'Pending User Response', 'Pending Organization Response'],
        default: 'Open'
    } 
}, { timestamps: true, collection: 'customer_support' })

const model = mongoose.model('Ticket', ticketSchema)
module.exports = model