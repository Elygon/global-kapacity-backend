const mongoose = require('mongoose')

const savedScholarSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scholarship_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarships', required: true }
}, {timestamps: true, collection: 'saved_scholarships'})

const model = mongoose.model('SavedScholarship', savedScholarSchema)
module.exports = model