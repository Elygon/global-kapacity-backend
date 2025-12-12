const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [
        { img_id: String, img_url: String }
    ],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    is_visible: { type: Boolean, default: true },
    comments: [{
        text: String,
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        commenter_type: { type: String, enum: ['User', 'Organization'], required: true },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true, collection: 'news' })

const model = mongoose.model('News', newsSchema)
module.exports = model