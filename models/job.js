const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    organization_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true},
    title: String,
    description: String, // job description
    responsibilities: [String],
    requirements: [String],
    preferred_skills: [String],
    deadline: String,
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
    custom_industry: { type: String, default: null},
    location: String,
    status: { type: String, enum: ['open', 'closed', /*'active', 'pending', 'rejected'*/],
        default: 'open' // pending as default in future if job listings will require approval first
    },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    isClosed: { type: Boolean, default: false }
}, { timestamps: true, collection: 'jobs' })

const model = mongoose.model('Job', jobSchema)
module.exports = model