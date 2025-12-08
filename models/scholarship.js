const mongoose = require('mongoose')

// Payment Categry Sub-Schema
const monetaryValueSchema = new mongoose.Schema({
    currency: String,
    fee: Number
}, { _id: false })

const scholarshipSchema = new mongoose.Schema({
    posted_by: { type: mongoose.Schema.Types.ObjectId, refPath: 'posted_by_model', required: true },
    posted_by_model: { type: String, enum: ['User', 'Organization'] },
    selected_kip: { type: mongoose.Schema.Types.ObjectId, refPath: 'selected_kip_model', default: null },
    selected_kip_model: { type: String, enum: ['User', 'Organization'] },

    // Step 1 (Scholarship Basicss)
    title: String, // scholarship name
    description: { type: String, maxlength: 100 },
    field_of_study: {
        type: String,
        enum: [
            'Medicine & Health', 'Engineering & Technology', 'Business & Management', 'Social Sciences', 'Arts & Humanities',
            'STEM', 'Law', 'Education', 'Open to All Fields'
        ]
    },
    sponsoring_org_name: String,
    scholarship_type: {
        type: String,
        enum: [
            'Fully Funded', 'Partially Funded', 'Tuition-Only', 'Stipend / Allowance', 'Research Grant', 'Travel Grant',
            'Short Course Scholarships'
        ]
    },
    mode_of_study: {
        type: String,
        enum: [
            'On-Campus', 'Online / Remote', 'Hybrid'
        ]
    },
    academic_level: {
        type: String,
        enum: [
            'High School', 'Undergraduate', 'Postgraduate / Masters', 'PhD / Doctoral', 'Vocational / Technical Programs'
        ]
    },
    interview_date: Date,
    winners_announcement_date: Date,
    disbursement_date: Date,
    application_link: String,

    // After Scholarship Posting has been submitting
    admin_status: {
        type: String,
        enum: ['submitted', 'rejected', 'approved', 'sent to kip'],
        default: 'submitted'
    },
    admin_rejection_reason: { type: String, default: null },
    kip_id: { type: mongoose.Schema.Types.ObjectId, ref: "KIP", default: null },
    kip_status: { type: String, enum: ['pending', 'verified', 'rejected', 'completed'], default: null },
    kip_rejection_reason: { type: String, default: null },
    is_visible: { type: Boolean, default: false },
    is_closed: { type: Boolean, default: false }
}, { timestamps: true, collection: 'scholarships' })

const model = mongoose.model('Scholarship', scholarshipSchema)
module.exports = model