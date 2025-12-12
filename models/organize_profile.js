const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orgProfileSchema = new Schema({
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    company_location: [{
        country: String,
        state: String,
        city: String,
        street_address: String,
    }],
    company_bio: [{
        industry: String,
        website: String,
        staffing: [{ type: String, enum: [ '10 Staff', '10-20', '20-50', '50-100', '100', '500', '1000' ]}], 
        vision: String,
        mission: String,
        about: String
    }],
    credentials: [{
        name_of_certification: String,
        issuing_organization: String,
        year_issued: String,
        certificate: [{ file_url: String, file_id: String, certificate_url: String }],
    }],
    services: [String],
    specialization: [String],
    clientele: [{
        name: String, // e.g 'QAREA Solutions'
        logo: { img_url: String, img_id: String }
    }],
    job_listings: [String],
    media: [{
        photos: [
            { file_id: String, file_url: String }
        ],
        videos: [
            { file_id: String, file_url: String}
        ],
        awards: [
            { file_id: String, file_url: String }
        ]
    }]
}, { timestamps: true, collection: 'organizations_profile'})

const model = mongoose.model('OrganizationProfile', orgProfileSchema)
module.exports = model