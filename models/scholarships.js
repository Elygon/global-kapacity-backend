const mongoose = require('mongoose')

const scholarshipSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    university: String,
    title: String,
    amount: String, // '$10,000' or '10000'
    description: String,
    eligibility_criteria: [String], // list of bullet points
    requirements: [String], // list of bullet points

    // for application important dates
    open_date: Date,
    deadline: Date,
    shortlist_date: Date,
    interview: {
        start_date: Date,
        end_date: Date
    },
    winners: {
        announcement_date: Date,
        disbursement_date: Date
    },

    // for application info
    academic_level: {
        type: String,
        enum: [
            'High School', 'Undergraduate', 'Postgraduate / Masters', 'PhD / Doctoral', 'Vocational / Technical Programs'
        ]
    },
    field_of_study: {
        type: String,
        enum: [
            'Medicine & Health', 'Engineering & Technology', 'Business & Technology', 'Social Sciences', 'Arts & Humanities',
            'STEM', 'Law', 'Education', 'Open to All Fields'
        ]
    },
    scholarship_type: {
        type: String,
        enum: [
            'Fully Funded', 'Partially Funded', 'Tuition-Only', 'Stipend / Allowance', 'Research Grant','Travel Grant',
            'Short Course Scholarships'
        ]
    },
    region: {
        type: String,
        enum: [
            'Study in Africa', 'Study in Europe', 'Study in USA / Canada', 'Study in UK', 'Study in Asia', 'Study in Australia',
            'Others'
        ]
    },
    gender_based: {
        type: String,
        enum: [
            'Female-Only', 'Male-Only', 'All'
        ]
    },
    mode_of_study: {
        type: String,
        enum: [
            'On-Campus', 'Online / Remote', 'Hybrid'
        ]
    },
    status: { type: String, enum: ['open', 'closed', /*'active', 'pending', 'rejected'*/],
            default: 'open' // pending as default in future if schoarship listings will require approval first
        },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    isClosed: { type: Boolean, default: false }
}, { timestamps: true, collection: 'scholarships' })

const model = mongoose.model('Scholarships', scholarshipSchema)
module.exports = model