const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    question: {type: String, required: true},

    // the post the comment belongs to
    post_type: { type: String, enum: [ 'Job', 'Scholarship', 'Training' ], required: true },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    text: String,

    // For replies
    parent_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    edited: { type: Boolean, default: false }
}, { timestamps: true, collection: 'comments'})

const model = mongoose.model('Comment', commentSchema)
module.exports = model