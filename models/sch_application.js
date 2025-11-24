const mongoose = require('mongoose')

const scholarApplySchema = new mongoose.Schema({
    scholarship_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarships', required: true},
    applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // basic personal info
    firstname: String,
    lastname: String,
    email: String,
    phone_no: String,
    date_of_birth: String,

    // eligibility info
    gpa: Number,
    currently_enrolled: Boolean,
    enrollment_institution: String,
    leadership_experience: String,

    // application requirements
    personal_statement: String,
    recommendation_letter: [{ file_url: String, file_id: String}], // file URL or cloud link
    resume: [{ file_url: String, file_id: String}],
    video: [ { file_url: String, file_id: String }], // optional short video

    // application status
    status: { type: String, enum: [ 'Pending', 'Shortlisted', 'accepted', 'Rejected' ], default: 'Pending' }
}, { timestamps: true, collection: 'scholarship_applications' })

const model = mongoose.model('ScholarshipApplication', scholarApplySchema)
module.exports = model