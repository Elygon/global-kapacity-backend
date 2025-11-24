const mongoose = require('mongoose')

// Trainer/Facilitator Sub-Schema
const TrainerSchema = new mongoose.Schema({
    fullname: String,
    description: String, // e.g 'Public Speaker'
    profile_link: String // Kapacity profile link, social link or website
}, { _id: false })

// Co-Organizer Sub-Schema
const CoOrganizerSchema = new mongoose.Schema({
    organization_name: String,
    profile_link: String
}, { _id: false })

// Payment Categry Sub-Schema
const PaymentCategorySchema = new mongoose.Schema({
    category: String,
    currency: String,
    fee: Number
}, { _id: false })

const trainingSchema = new mongoose.Schema({
    posted_by: {type: mongoose.Schema.Types.ObjectId, refPath: 'Posted_by_model', required: true},
    posted_by_model: { type: String, enum: ['User', 'Organization']},

    // Step 1 (Training Details)
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
    training_type: { type: String, enum: [ 'Bootcamp', 'Master Class', 'Seminar', 'Workshop'] },
    training_mode: { type: String, enum: [ 'Virtual', 'In-Person', 'Hybrid'] },
    address: String,
    date: Date,
    time: String,
    reg_deadline: Date,
    is_certified: { type: Boolean, default: false },
    banner_img: [{ img_id: String, img_url: String }],

    // Step 2 (Training Description)
    about: { type: String, maxlength: 150 },
    gain: { type: String, maxlength: 150 },
    attendee: { type: String, maxlength: 100 }, // who's allowed to attend e.g UI/UX Designers, Brand Designers, etc
    trainers: [TrainerSchema],
    co_organizers: [CoOrganizerSchema],

    // Step 3 (Training Registration)
    is_paid: Boolean,

    // In-Person only - payment categories available
    has_payment_categories: { type: Boolean, default: false },
    payment_categories: [PaymentCategorySchema], // For in-person
    training_fee: Number,
    training_link: String,
    reg_method: { type: String, enum: [ 'kapacity', 'external link' ], default: 'kapacity' },
    external_reg_link: String,
    msg: { type: String, maxlength: 150 },

    event_type: {
        type: String,
        enum: [
            'Free Virtual Event', 'Paid Event In-Person', 'Paid Event Hybrid'
        ]
    },
    images: [
        { img_id: String, img_url: String }
    ]
}, { timestamps: true, collection: 'trainings' })

const model = mongoose.model('Training', trainingSchema)
module.exports = model