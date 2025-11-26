const express = require('express')
const router = express.Router()

const Testimonial = require("../../models/testimonial.js")
const authToken = require('../../middleware/authToken')


// View all testimonials (public)
router.post('/all', authToken, async (req, res) => {
    try {
        // fetch all public testimonials
        const testimonials = await Testimonial.find().populate('user', 'firstname lastname email')
        .populate('organization', 'company_name email').sort({ createdAt: -1 })

        if (!testimonials.length) {
            return res.status(200).send({ status: 'ok', msg: 'No testimonials yet.' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', testimonials })

    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Approve testimonials
router.post('/approve', authToken, async(req, res) => {
    const { testimonial_id } = req.body

    try {
        const testimonial = await Testimonial.findById(testimonial_id)
        if (!testimonial) {
            return res.status(404).send({ status: 'error', msg: 'Testimonial not found' })
        }

        testimonial.status = 'approved'
        testimonial.approved_at = new Date()
        testimonial.approved_by = req.user._id

        await testimonial.save()

        return res.status(200).send({ status: 'ok', msg: 'success', testimonial })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Reject testimonials
router.post('/reject', authToken, async(req, res) => {
    const { testimonial_id } = req.body

    try {
        const testimonial = await Testimonial.findById(testimonial_id)
        if (!testimonial) {
            return res.status(404).send({ status: 'error', msg: 'Testimonial not found' })
        }

        testimonial.status = 'rejected'
        testimonial.approved_at = null
        testimonial.approved_by = req.user._id

        await testimonial.save()

        return res.status(200).send({ status: 'ok', msg: 'success', testimonial })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


module.exports = router