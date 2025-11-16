const mongoose = require('mongoose')

const jobApplySchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job'},
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    resume_cv: [{ file_url: String, file_id: String}], // uploaded resume/CV files
    cover_letter: [ { file_url: String, file_id: String }], // optional for uploaded cover letters
    message: String,
    status: { type: String, enum: [ 'Interview', 'Rejected', 'Pending', 'Offer'], default: 'Pending' }
}, { timestamps: true, collection: 'job_applications' })

const model = mongoose.model('JobApplication', jobApplySchema)
module.exports = model