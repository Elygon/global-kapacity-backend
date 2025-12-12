const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userProfileSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gender: String,
    address: String,
    date_of_birth: String,
    professional_bio: [{
        about: String,
        state_of_origin: String,
        city_of_residence: String,
        country_of_residence: String,
        country_of_origin: String
    }],
    school: [{
        name_of_school: String,
        degree_attained: String, // Masters, Bachelor, WASSCE, etc.
        entry_year: String,
        graduation_year: String
    }],
    organization: [{
        name_of_organization: String,
        role: String,
        from: String, // the start year  
        to: String, // the end year
        organization_duties: String
    }],
    certifications: [{
        title: String,
        issuer: String, // issuing organization
        year_issued: String,
        certificate_images: [
            { img_id: String, img_url: String }
        ]
    }],
    skills: [{
        type: String,
        enum: ['Adaptability', 'Analytical Thinking', 'Attention to Detail', 'Artificial Intelligence', 'Audit and Compliance',
            'Business Analysis', 'Budget Management', 'Branding', 'Bookkeeping', 'Blockchain', 'Communication', 'Collaboration',
            'Conflict Resolution', 'Content Creation', 'Copywriting', 'Critical Thinking', 'Customer Service', 'Cybersecurity',
            'Data Analysis', 'Data Entry', 'Decision-Making', 'Design Thinking', 'Digital Marketing', 'Diplomacy', 'Emotional Intelligence',
            'Empathy', 'Event Planning', 'Enterpreneurship', 'Ethical Thinking', 'Financial Management', 'Flexibility', 'Forecasting',
            'Fundraising', 'Goal Setting', 'Graphics Design', 'Growth Strategy', 'Human Resource Management', 'HTML/CSS', 'Help Desk Support',
            'Innovation', 'Interpersonal  Skills', 'Inventory Management', 'IT Support', 'Journalism', 'Judgement and Decision Making',
            'Knowledge Management', 'Key Account Management', 'Leadership', 'Listening Skills', 'Logistics Coordination',
            'Management', 'Market Research', 'Marketing Strategy', 'Mentoring', 'Multitasking', 'Negotiation', 'Networking',
            'Numerical Analysis', 'Office Administration', 'Organization', 'Operations Management', 'Problem-Solving',
            'Presenation Skills', 'Project Management', 'Public Speaking', 'Python Programming', 'Quality Assurance',
            'Quantitative Analysis', 'Research', 'Reporting', 'Risk Management', 'Sales', 'Scheduling',
            'Search Engine Optimization (SEO)', 'Social Media Management', 'Software Development', 'Strategic Planning',
            'Stress Management', 'Teamwork', 'Technical Writing', 'Time Management', 'Training & Development', 'Troubleshooting',
            'User Experience (UX) Design', 'User Interface (UI) Design', 'Verbal Communication', 'Video Editing', 'Virtual Collaboration',
            'Web Development', 'Writing', 'XML Knowledge', 'Youth Mentorship', 'Zero-Defect Mindset', 'Zonal Coordination'
        ]
    }],
    professional_membership: [String],
    media: [{
        photos: [
            { file_id: String, file_url: String }
        ],
        videos: [
            { file_id: String, file_url: String }
        ],
        awards: [
            { file_id: String, file_url: String }
        ]
    }],
    others: {
        languages: [{
            name: String, strenth: String // e.g 'Fluent', 'Intermediate'
        }],
        hobbies: [String], // e.g 'Reading', 'Singing'
        references: [{
            fullname: String,
            email: String,
            profile_link: { type: String, default: '' } // optional
        }],
        social_links: {
            facebook: String,
            twitter: String,
            instagram: String,
            youtube: String,
            dribble: String,
            pinterest: String,
            linkedIn: String,
            tiktok: String
        }
    },
    mentors: [{
        fullname: String,
        profile_link: String
    }],
    name_of_certification: String,
    verification: {
        firstname: String,
        lastname: String,
        id_no: String,
        gov_id_url: String,
        gov_id: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        submitted_at: Date,
        reviewed_at: Date,
        reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        rejection_reason: String
    }
}, { timestamps: true, collection: 'users_profile' })

const model = mongoose.model('UserProfile', userProfileSchema)
module.exports = model