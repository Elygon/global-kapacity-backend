const express = require('express')
const router = express.Router()

const Comment = require('../../models/comment')
const News = require('../../models/news')
const authToken = require('../../middleware/authToken')



// ------------------------------
// Add a comment or reply
// ------------------------------
// POST comments
router.post('/add', authToken, async (req, res) => {
    try {
        const { newsId, parentCommentId, content } = req.body
        if (!newsId || !content) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        const news = await News.findOne({ _id: newsId, is_visible: true })
        if (!news) return res.status(404).send({ status: 'error', msg: 'News not found' })

        const comment = new Comment({
            newsId,
            parentCommentId: parentCommentId || null,
            user_id: req.user._id,
            content
        })

        await comment.save()
        res.status(201).send({ status: 'ok', msg: 'success', comment })
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})


// ------------------------------
// View comments for a news post
// ------------------------------
router.post('/view', authToken, async (req, res) => {
    try {
        const { newsId, page = 1, limit = 10 } = req.body
        if (!newsId) return res.status(400).send({ status: 'error', msg: 'News ID is required' })

        const skip = (page - 1) * limit

        // Fetch top-level comments (parentCommentId === null)
        const comments = await Comment.find({ newsId, parentCommentId: null, is_visible: true })
            .populate('user_id', 'firstname lastname profile_img_url') // fetch user info
            .populate('organization_id', 'company_name profile_img_url') // fetch organization info
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        // For each top-level comment, fetch replies
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentCommentId: comment._id, is_visible: true })
                    .populate('user_id', 'firstname lastname profile_img_url')
                    .populate('organization_id', 'company_name profile_img_url')
                    .sort({ createdAt: 1 }) // oldest first
                return { ...comment.toObject(), replies }
            })
        )

        res.status(201).send({ status: 'ok', msg: 'success', comments: commentsWithReplies })
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})


// ------------------------------
// Update a comment
// ------------------------------
router.post('/update', authToken, async (req, res) => {
    try {
        const { commentId, content } = req.body
        if (!commentId || !content) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        const comment = await Comment.findOne({ _id: commentId, user_id: req.user._id, is_visible: true });
        if (!comment) {
            return res.status(404).send({ status: 'error', msg: 'Comment not found' })
        }

        comment.content = content
        await comment.save()

        res.status(200).send({ status: 'ok', msg: 'success', comment })
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})


// ------------------------------
// Delete a comment
// ------------------------------
router.post('/delete', authToken, async (req, res) => {
    try {
        const { commentId } = req.body
        if (!commentId) return res.status(400).send({ status: 'error', msg: 'Comment ID is required' })

        const comment = await Comment.findOne({ _id: commentId, user_id: req.user._id })
        if (!comment) {
            return res.status(404).send({ status: 'error', msg: 'Comment not found' })
        }

        // Soft delete
        comment.is_visible = false
        await comment.save()

        res.status(201).send({ status: 'ok', msg: 'success', comment })
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})


module.exports = router