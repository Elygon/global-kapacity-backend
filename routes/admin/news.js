const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const News = require('../../models/news')
const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')



// Post News
router.post('/Post', authToken, uploader.array('images', 2), async (req, res) => {
    const { title, content, is_visible } = req.body

    if (!title || !content) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required.' })
    }

    try {
        let images = []

        // Handle uploaded files first
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Upload main image
                const upload = await cloudinary.uploader.upload(file.path,
                    { folder: "news-images" }
                )

                // Upload thumbnail
                const thumb = await cloudinary.uploader.upload(file.path, {
                    folder: 'news-images-thumbs',
                    crop: 'fill',
                    width: 200,
                    height: 200,
                    quality: 'auto'
                })

                images.push({
                    img_id: upload.public_id, img_url: upload.secure_url,
                    thumb_id: thumb.public_id, thumb_url: thumb.secure_url
                }
                )
            }
        }

        // Handle JSON images sent in the request body
        let bodyImages = []
        if (req.body.images) {
            try {
                // If images are sent as JSON string, parse it
                bodyImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images
            } catch (err) {
                return res.status(400).send({ status: "error", msg: "Invalid format for images", error: err.message })
            }

            if (Array.isArray(bodyImages) && bodyImages.length > 0) {
                for (const img of bodyImages) {
                    if (img.img_id && img.img_url) {
                        images.push({ img_id: img.img_id, img_url: img.img_url });
                    }
                }
            }
        }

        const news = new News({
            title,
            content,
            images, // attach upload
            is_visible: is_visible !== undefined ? is_visible : true,
            created_by: req.user._id
        })

        await news.save()
        return res.status(201).send({ status: 'ok', msg: 'success', news })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


//Update News
router.post('/update', authToken, uploader.array('images', 2), async (req, res) => {
    const { newsId, ...updateData } = req.body

    if (!newsId) {
        return res.status(400).send({ status: 'error', msg: 'News ID is required.' })
    }

    try {
        const news = await News.findById(newsId)
        if (!news) {
            return res.status(404).send({ status: "error", msg: "News not found" })
        }

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary first
            if (news.images && news.images.length > 0) {
                for (const img of news.images) {
                    await cloudinary.uploader.destroy(img.img_id)
                }
            }

            // Upload new ones
            const uploadedImages = []
            for (const file of req.files) {
                const upload = await cloudinary.uploader.upload(file.path, { folder: 'news-images' })

                // Generate thumbnail URL (on the fly using Cloudinary URL transformation)
                const thumbUrl = upload.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/')

                uploadedImages.push({
                    img_id: upload.public_id, img_url: upload.secure_url,
                    thumb_url: thumbUrl // can send to the frontend only
                })
            }

            updateData.images = uploadedImages
        }

        const updatedNews = await News.findByIdAndUpdate(newsId, updateData, { new: true })

        if (!updatedNews) {
            return res.status(404).send({ status: "error", msg: "News not found" })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', updatedNews })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Delete News
router.post('/delete', authToken, async (req, res) => {
    const { newsId } = req.body

    if (!newsId) {
        return res.status(400).send({ status: 'error', msg: 'News ID is required' })
    }

    try {
        const deletedNews = await News.findByIdAndDelete(newsId)
        if (!deletedNews) {
            return res.status(404).send({ status: 'error', msg: 'News not found' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', deletedNews })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


//View all News 
router.post('/all', authToken, async (req, res) => {
    try {
        const news = await News.find({ is_visible: true })
            .sort({ createdAt: -1 })
            .populate('comments.user_id', 'firstname lastname email profile_img_url')
            .populate('comments.organization_id', 'company_name email profile_img_url')
        return res.status(200).send({ status: 'ok', msg: 'success', news })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


//View a single News by ID
router.post('/view', authToken, async (req, res) => {
    const { newsId } = req.body

    if (!newsId) {
        return res.status(400).send({ status: 'error', msg: 'News ID is required.' })
    }

    try {
        const news = await News.findById(newsId)
            .populate('comments.user_id', 'firstname lastname email profile_img_url')
            .populate('comments.organization_id', 'company_name email profile_img_url')
        if (!news) {
            return res.status(404).send({ status: 'error', msg: 'News not found.' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', news })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


module.exports = router