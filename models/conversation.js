const mongoose = require('mongoose')

const convoSchema = new mongoose.Schema({
    participants: [{
        participantType: { type: String, enum: [ 'User', 'Organization' ], required: true },
        participant_id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'participants.participantType' }
    }],
    last_msg: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, collection: 'conversations' })

const model = mongoose.model('Conversation', convoSchema)
module.exports = model