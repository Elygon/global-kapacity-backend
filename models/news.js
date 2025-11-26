const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    images: [
        { img_id: String, img_url: String }
    ],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    is_visible: { type: Boolean, default: true }
}, { timestamps: true, collection: 'news' })

const model = mongoose.model('News', newsSchema)
module.exports = model