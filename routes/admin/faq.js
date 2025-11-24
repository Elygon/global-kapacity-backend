const express = require('express')
const router = express.Router()
const authToken = require('../../middleware/authToken')
const FAQ = require('../../models/faq')



//Add a new FAQ
router.post('/add', authToken, async (req, res) => {
    const { question, answer } = req.body

    if (!question || !answer) {
        return res.status(400).send({ status: 'error', msg: 'Both question and answer are required.' })
    }

    try {
        const faq = new FAQ({ question, answer, timestamp: Date.now() })
        await faq.save()
        return res.status(200).send({ status: 'ok', msg: 'success', faq })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


//Update an existing FAQ
router.post('/update', authToken, async (req, res) => {
    const { id, question, answer } = req.body

    if (!id || (!question && !answer)) {
        return res.status(400).send({ status: 'error', msg: 'FAQ ID and at least one field to update are required.' })
    }

    try {
        const updatedFAQ = await FAQ.findByIdAndUpdate(
            id,
            { $set: { ...(question && { question }), ...(answer && { answer }) } },
            { new: true }
        )

        if (!updatedFAQ) {
            return res.status(404).send({ status: 'error', msg: 'FAQ not found' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', updatedFAQ })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Delete an FAQ
router.post('/delete', authToken, async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).send({ status: 'error', msg: 'FAQ ID is required' })
    }

    try {
        const deletedFAQ = await FAQ.findByIdAndDelete(id)
        if (!deletedFAQ) {
            return res.status(404).send({ status: 'error', msg: 'FAQ not found' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', deletedFAQ })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


//View all FAQs 
router.post('/all', authToken, async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ timestamp: -1 })
        return res.status(200).send({ status: 'ok', msg: 'success', faqs })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


//View a single FAQ by ID
router.post('/view', authToken, async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).send({ status: 'error', msg: 'FAQ ID is required.' })
    }

    try {
        const faq = await FAQ.findById(id)
        if (!faq) {
            return res.status(404).send({ status: 'error', msg: 'FAQ not found.' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', faq })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


module.exports = router