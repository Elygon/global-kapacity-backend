const mongoose = require('mongoose')

const kipSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    /*app_id: { type: mongoose.Schema.Types.ObjectId, ref: 'KapacityPartners', required: true },*/

    organization_name: String,
    organization_type: { type: String, enum: ['NGO', 'Foundation', 'Community Group'] },
    reg_no: String, // company/business registration number
    aof: [{
        type: String, enum: ['Education', 'Skill Training', 'Vocational Development',
            'Community Development', 'Others' // Default for custom input
        ]
    }],  // AOF (Area Of Focus)
    custom_aof: { type: String, default: null }, // for Others
    countries: [String],  // countries you serve
    location: String, // country's location
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedAt: { type: Date, default: Date.now },

    // partnership status
    status: {
        type: String, enum: ['Active', 'Suspended'], default: 'Active'
    },
    /*isPartner: { type: Boolean, default: true },
    /*expiry_date: { type: Date, default: Date.now },*/

    /* permissions given to partners
    canPostJobs: { type: Boolean, default: true },
    canPostTrainings: { type: Boolean, default: true },
    canPostScholarships: { type: Boolean, default: true },*/
    posting_limit: { type: Number, default: 0 }, // 0 i.e unlimited unless the clients specify limits

    // For replies
    parent_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    edited: { type: Boolean, default: false }
}, { timestamps: true, collection: 'kapacity_impact_partners' })

const model = mongoose.model('KIP', kipSchema)
module.exports = model