const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    posted_by: {type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true},

    // Step 1 for Job Posting
    title: String,
    industry: {
        type: String,
        enum: [
            'Aerospace & Aviation', 'Agriculture & Agribusiness', 'Automotive & Mobility', 'Banking/Fintech', 'Beauty & Wellness',
            'Communication/Digital Marketing', 'Construction & Engineering', 'Consulting & Advisory', 'Content/Social Influencer',
            'Creative & Media','Education & Training','Energy & Utilities','Entertainment & Events', 'Environmental Services',
            'Fashion & Apparel', 'Finance and Banking', 'Food & Beverage', 'Government & Public Services', 'Healthcare & Medical',
            'Hospitality & Tourism', 'Human Resources & Recruitment', 'Information and Communication Technology', 'Legal & Compliance',
            'Logistics & Transportation', 'Manufacturing & Industrial', 'Non-Profit & NGOs', 'Printing & Publishing', 'Real Estate & Property',
            'Realestate/Property Management', 'Research & Development', 'Retail & E-commerce', 'Security & Safety Services',
            'Sports & Recreation', 'Technology & Software', 'Telecommunications', 'Others' // Default for custom input
        ]
    },
    custom_industry: { type: String }, // only used if industry === 'Other'
    employment_type: {
        type: String,
        enum: [ 'Full-Time', 'Part-Time', 'Contract', 'Internship', 'Volunteer'],
        required: true
    },
    work_mode: {
        type: String,
        enum: [ 'On-site', 'Remote', 'Hybrid' ],
        required: true
    },
    country: [String],
    state: [String],
    salary_range: {
        currency: String, // front-end ensures valid currency e.g NGN, USD, EUR, GBP
        from: Number,
        to: Number
    },
    deadline: String,

    // Step 2 Job Posting
    description: { type: String, maxlength: 150 }, // job description
    responsibilities: { type: String, maxlength: 150 },
    requirements: { type: String, maxlength: 150 },
    preferred_skills: { type: String, maxlength: 150 },
    email: String,

    // After Job Posting has been submitting
    is_visible: { type: Boolean, default: false }, // becomes true after admin aproval
    is_rejected: { type: Boolean, default: false }, // optional
    rejection_reason: { type: String, default: null },


    job_type: { 
        main: { type: String, enum: [ 'A', 'B' ]},
        sub: [{
            type: String, enum: [ 'All', 'Full-Time', 'Part-Time', 'Internship', 'Contract', 'Temporary',
                'Remote', 'Hybrid', 'Onsite']
        }]
    },
    experience_level: { type: String, enum: [ 'All', 'Entry Level (0-1 year)', 'Junior (1-3 years)',
        'Mid-Level(3-5 years)', 'Senior (5-10 years)', 'No Experience Required']
    },
    location: String,
    isClosed: { type: Boolean, default: false }
}, { timestamps: true, collection: 'jobs' })

const model = mongoose.model('Job', jobSchema)
module.exports = model