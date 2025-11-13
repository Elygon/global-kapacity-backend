const mongoose = require('mongoose')
const Schema = mongoose.Schema

const organizationSchema = new Schema({
    role: { type: String, default: 'organization' },
    name_of_organization: String,
    company_reg_no: String,
    industry: {
        type: String,
        enum: [
            'Aerospace & Aviation',
            'Agriculture & Agribusiness',
            'Automotive & Mobility',
            'Banking/Fintech',
            'Beauty & Wellness',
            'Communication/Digital Marketing',
            'Construction & Engineering',
            'Consulting & Advisory',
            'Content/Social Influencer',
            'Creative & Media',
            'Education & Training',
            'Energy & Utilities',
            'Entertainment & Events',
            'Environmental Services',
            'Fashion & Apparel',
            'Finance and Banking',
            'Food & Beverage',
            'Government & Public Services',
            'Healthcare & Medical',
            'Hospitality & Tourism',
            'Human Resources & Recruitment',
            'Information and Communication Technology',
            'Legal & Compliance',
            'Logistics & Transportation',
            'Manufacturing & Industrial',
            'Non-Profit & NGOs',
            'Printing & Publishing',
            'Real Estate & Property',
            'Realestate/Property Management',
            'Research & Development',
            'Retail & E-commerce',
            'Security & Safety Services',
            'Sports & Recreation',
            'Technology & Software',
            'Telecommunications',
            'Others (Please Specify)', // Default for custom input
        ],
        default: 'Others (Please Specify)'
    },
    email: String, 
    phone_no: String,
    password: String,
    profile_img_id: { type: String, default: '' },
    profile_img_url: { type: String, default: '' },
    address: String,
    authProvider: {
        type: String,
        enum: ['email', 'google', 'apple'],
        default: 'email' // default is normal signup
    },
    is_online:{type: Boolean, default: false },
    is_deleted: {type: Boolean, default: false},
    last_login: Number,
    last_logout: Number, 
    status: {type: String, enum: ["Active", "Suspended", "Deactivated"], default: "Active"},//Status can be 'Active', 'Suspended' or 'Deleted'
    is_verified: { type: Boolean, default: false },
    is_blocked: { type: Boolean, default: false },
    block_reason: {type: String, default: ''},
    is_banned: { type: Boolean, default: false },
    ban_reason: {type: String, default: ''},
    deletionReason: {
        type: String,
        default: null}, //Reason provided by the staff when the account is deleted
}, { timestamps: true, collection: 'organizations'})

const model = mongoose.model('Organization', organizationSchema)
module.exports = model