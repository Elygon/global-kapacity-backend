const mongoose = require('mongoose')

const applySchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true},
    applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    resume_cv: [{ file_url: String, file_id: String}], // uploaded resume/CV files
    cover_letter: [ { file_url: String, file_id: String }], // optional for uploaded cover letters
    message: String,
    status: { type: String, enum: [ 'Interview', 'Rejected', 'Pending', 'Offer'], default: 'Pending' },
    is_flagged: { type: Boolean, default: false },
    flag_reason: {type: String, default: ''},
}, { timestamps: true, collection: 'applications' })

const model = mongoose.model('Application', applySchema)
module.exports = model