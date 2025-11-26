const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    newsId: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    content: {type: String, required: true},
    is_visible: { type: Boolean, default: true },
}, { timestamps: true, collection: 'comments'})

const model = mongoose.model('Comment', commentSchema)
module.exports = model