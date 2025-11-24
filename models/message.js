const mongoose = require('mongoose')

const mgsSchema = new mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }, 
    sender_type: { type: String, enum: [ 'User', 'Organization' ], required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'sender_type', required: true },
    msg_type: { type: String, enum: [ 'text', 'voice', 'image', 'video', 'document' ], required: true },
    text: { type: String, default: null},
    media_url: { type: String, default: null }, // voice, image, video, pdf
    media_duration: { type: String, default: null }, //for voicenote (seconds)
    isDeleted: { type: Boolean, default: false}
}, { timestamps: true, collection: 'messages' })

const model = mongoose.model('Message', mgsSchema)
module.exports = model