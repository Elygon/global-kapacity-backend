const mongoose = require('mongoose')

const kipApplySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

    // Step 1 - Organizaton Details
    organization_name: String,
    organization_type: {
        type: String, enum: ['NGO', 'Foundation', 'Community Group']
    },
    reg_no: String, // company/business registration number
    aof: [{
        type: String,  // AOF (Area Of Focus)
        enum: ['Education', 'Skill Training', 'Vocational Development', 'Community Development', 'Others']
    }],
    aof_other: String,
    email: String,
    phone_no: String,
    website: String, // Organization website
    countries: [String],  // countries you serve
    location: String, // country's location
    social_links: [String], // array of URLs

    // Step 2 = Contact and Verification
    contact_name: String, // name of contact person
    role: String, // role/postion of contact person
    document: { file_id: String, file_url: String }, // verification document e.g CAC certificate or ID
    description: { type: String, maxlength: 200 }, // brief description of your work
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

    // Admin review Info
    reviewed_at: Date,
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    rejection_reason: String
}, { timestamps: true, collection: 'kip_applications' })

const model = mongoose.model('KIPApplication', kipApplySchema)
module.exports = model