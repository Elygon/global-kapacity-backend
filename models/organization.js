const mongoose = require('mongoose')
const Schema = mongoose.Schema

const organizationSchema = new Schema({
    role: { type: String, default: 'organization' },
    company_name: String,
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
            'Others', // Default for custom input
        ]
    },
    custom_industry: { type: String, default: null}, // for Others
    email: String, 
    phone_no: String,
    password: String,
    authProvider: {
        type: String,
        enum: ['email', 'google', 'apple'],
        default: 'email' // default is normal signup
    },

    // for subscription plans
    subscription: {
        plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
        billing_cycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: null },
        start_date: Date,
        end_date: Date,
        status: { type: String, enum: ['inactive', 'active', 'expired'], default: 'inactive' }
    },

    // for organization's account status
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