const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Job = require('../../models/job')


// =========================================
// CREATE JOB
// =========================================
router.post('/create', authToken, async (req, res) => {
    const { title, description, responsibilities, requirements, preferred_skills, job_type, experience_level, deadline,
        location, salary_range
    } = req.body

    if (!title || !description || !responsibilities || !requirements || !preferred_skills || !job_type
        || !experience_level || !deadline) {
        return res.status(400).send({ status: 'error', msg: 'Required fields missing' })
    }

    try {
        const job = new Job({
            title,
            description,
            responsibilities,
            requirements,
            preferred_skills,
            job_type,
            experience_level,
            deadline,
            location,
            salary_range,
            posted_by: req.user._id,   // organization ID from token
            status: 'open',
        })

        await job.save()

        return res.status(200).send({ status: 'ok', msg: 'success', job })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// GET ALL JOBS CREATED BY THIS ORGANIZATION
// =========================================
router.post('/all', authToken, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ date_posted: -1 })

        if (!jobs.length)
            return res.status(200).send({ status: 'ok', msg: 'No job postings found' })

        return res.status(200).send({ status: 'ok', msg: 'success', count: jobs.length, jobs })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// VIEW A SPECIFIC JOB
// =========================================
router.post('/view', authToken, async (req, res) => {
    const { id } = req.body

    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const job = await Job.findOne({ _id: id, postedBy: req.user._id })
        
        if (!job)
            return res.status(404).send({ status: 'error', msg: 'Job not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', job })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// UPDATE A JOB INFO
// =========================================
router.post('/update', authToken, async (req, res) => {
    const { id, ...updateData } = req.body
    
    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const job = await Job.findOne({ _id: id, postedBy: req.user._id })

        if (!job)
            return res.status(404).send({ status: 'error', msg: 'Job not found' })

        updateData.timestamp = Date.now()

        const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true })

        return res.status(200).send({ status: 'ok', msg: 'success', job: updatedJob })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// CLOSE A JOB POSTING
// =========================================
router.post('/close', authToken, async (req, res) => {
    const { id } = req.body

    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const job = await Job.findOne({ _id: id, postedBy: req.user._id })

        if (!job)
            return res.status(404).send({ status: 'error', msg: 'Job not found' })

        job.status = 'closed'
        job.timestamp = Date.now()
        await job.save()

        return res.status(200).send({ status: 'ok', msg: 'success', job })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// DELETE JOB POSTING
// =========================================
router.post('/delete', authToken, async (req, res) => {
    const { id } = req.body

    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const deleted = await Job.findOneAndDelete({ _id: id, postedBy: req.user._id })

        if (!deleted)
            return res.status(404).send({ status: 'error', msg: 'Job not found or already deleted' })

        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})


module.exports = router