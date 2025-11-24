const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Scholarship = require('../../models/scholarships')


// =========================================
//  POST SCHOLARSHIP OPPORTUNITY
// =========================================
router.post('/post', authToken, async (req, res) => {
    const { title, description, university, scholarship_type, amount, eligibility_criteria, requirements, open_date,
        deadline, mode_of_study
    } = req.body

    if (!title || !description || !university || !scholarship_type || !amount || !eligibility_criteria || !requirements
        || !open_date || !deadline || !mode_of_study) {
        return res.status(400).send({ status: 'error', msg: 'Required fields missing' })
    }

    try {
        const scholarship = new Scholarship({
            title,
            description,
            university,
            scholarship_type,
            amount,
            eligibility_criteria,
            requirements,
            open_date,
            deadline,
            mode_of_study,
            posted_by: req.user._id,   // organization ID from token
            status: 'open'
        })

        await scholarship.save()

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// GET ALL SCHOLARSHIP POSTED BY THIS ORGANIZATION
// =========================================
router.post('/all', authToken, async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ postedBy: req.user._id }).sort({ date_posted: -1 })

        if (!scholarships.length)
            return res.status(200).send({ status: 'ok', msg: 'No scholarships found' })

        return res.status(200).send({ status: 'ok', msg: 'success', count: scholarships.length, scholarships })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// VIEW A SPECIFIC SCHOLARSHIP
// =========================================
router.post('/view', authToken, async (req, res) => {
    const { id } = req.body

    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const scholarship = await Scholarship.findOne({ _id: id, postedBy: req.user._id })
        
        if (!scholarship)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// UPDATE SCHOLARSHIP
// =========================================
router.post('/update', authToken, async (req, res) => {
    const { id, ...updateData } = req.body
    
    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const scholarship = await Scholarship.findOne({ _id: id, postedBy: req.user._id })

        if (!scholarship)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found' })

        updateData.timestamp = Date.now()

        const updatedScholarship = await Scholarship.findByIdAndUpdate(id, updateData, { new: true })

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship: updatedScholarship })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// CLOSE SCHOLARSHIP
// =========================================
router.post('/close', authToken, async (req, res) => {
    const { id } = req.body

    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const scholarship = await Scholarship.findOne({ _id: id, postedBy: req.user._id })

        if (!scholarship)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found' })

        scholarship.status = 'closed'
        scholarship.timestamp = Date.now()
        await scholarship.save()

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// DELETE SCHOLARSHIP
// =========================================
router.post('/delete', authToken, async (req, res) => {
    const { id } = req.body

    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const deleted = await Scholarship.findOneAndDelete({ _id: id, postedBy: req.user._id })

        if (!deleted)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found or already deleted' })

        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})


module.exports = router