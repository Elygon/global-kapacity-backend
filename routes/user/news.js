const express = require('express')
const router = express.Router()

const News = require('../../models/news')
const authToken = require('../../middleware/authToken')


//Get all visible news
router.post('/all', authToken, async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.body  // support pagination
        const skip = (page - 1) * limit

        //Fetch all visible news
        const newsList = await News.find({ is_visible: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('comments.user_id', 'firstname lastname email profile_img_url')
            .populate('comments.organization_id', 'company_name email profile_img_url')

        if (newsList.length === 0) {
            return res.status(200).send({ status: "ok", msg: "No available news at the moment" })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', count: newsList.length, newsList })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// View a single news by ID
router.post('/view', authToken, async (req, res) => {
    const { newsId } = req.body

    if (!newsId) {
        return res.status(400).send({ status: 'error', msg: 'News ID must be provided' })
    }

    try {
        const news = await News.findOne({ _id: newsId, is_visible: true })
            .populate('comments.user_id', 'firstname lastname email profile_img_url')
            .populate('comments.organization_id', 'company_name email profile_img_url')

        if (!news) {
            return res.status(404).send({ status: "error", msg: "News not found" })
        }
        return res.status(200).send({ status: 'ok', msg: 'success', news })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// endpoint to comment on news
router.post('/comment', authToken, async (req, res) => {
    try {
        const { news_id, text } = req.body

        if (!news_id || !text) {
            return res.status(400).send({ status: 'error', msg: 'News ID and comment text are required' })
        }

        const news = await News.findById(news_id)
        if (!news) {
            return res.status(404).send({ status: 'error', msg: 'News not found' })
        }

        const comment = {
            text,
            user_id: req.user._id,
            commenter_type: 'User'
        }

        news.comments.push(comment)
        await news.save()

        return res.status(200).send({ status: 'ok', msg: 'Comment added', comments: news.comments })

    } catch (error) {
        return res.status(500).send({ status: 'error', msg: error.message })
    }
})

module.exports = router