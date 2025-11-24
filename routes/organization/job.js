const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Job = require('../../models/job')
const { canPostOpportunities } = require("../../middleware/kipPermit")


// ==========================
// STEP 1: POST A JOB
// ==========================
router.post("/step_one", authToken, canPostOpportunities, async (req, res) => {
    const { title, industry, employment_type, work_mode, country, state, salary_range, deadline } = req.body

    if ( !title || !industry || !employment_type || !work_mode || !country || !state || !salary_range || !deadline ) {
        return res.status(400).send({ status: 'error', send: 'All fields are required'})
    }
    
    try {
        const newJob = new Job({
            organizationId: req.user._id,
            title,
            industry,
            employment_type,
            work_mode,
            country,
            state,
            salary_range,
            deadline,
            step: 1
        })

        await newJob.save()
        res.status(201).send({ status: 'ok', msg: "success", newJob })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// STEP 2: POST A JOB
// ==========================
router.post("/step_two", authToken, canPostOpportunities, async (req, res) => {
    const { jobId, description, responsibilities, requirements, preferred_skills, email } = req.body
    if (!jobId || !description || !responsibilities || !requirements || !preferred_skills || !email ) {
        return res.status(404).send({ status: 'error', msg: "All fields are required" })
    }
    
    try {
        const job = await Job.findById(JobId)

        if (!job) {
            return res.status(404).send({ status: 'error', msg: "Job not found." })
        }

        // Update step 2 details
        job.description = description
        job.responsibilities = responsibilities
        job.requirements = requirements
        job.preferred_skills = preferred_skills
        job.email = email
        job.step = 2

        await job.save()
        res.status(200).send({ status: 'ok', msg: "success", job })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})



// =========================================
// STEP 3: JOB PREVIEW
// =========================================
router.post('/preview', authToken, canPostOpportunities, async (req, res) => {
    const { jobId } = req.body

    try {
        const job = await Job.findOne({ _id: jobId , organization: req.user._id })

        if (!job)
            return res.status(404).send({ status: 'ok', msg: 'Job not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', job })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// PUBLISH JOB
// =========================================
router.post('/publish', authToken, canPostOpportunities, async (req, res) => {
    const { jobId } = req.body
    
    try {
        const job = await Job.findOneAndUpdate({ _id: jobId , organization: req.user._id },
            { submitted: true, updatedAt: Date.now() }, { new: true }
        )

        if (!job)
            return res.status(404).send({ status: 'ok', msg: 'Job not found' })

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
        const jobs = await Job.find({ posted_by: req.user._id }).sort({ date_posted: -1 })

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
    const { jobId } = req.body

    if (!jobId)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const job = await Job.findOne({ _id: jobId, posted_by: req.user._id })
        
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
    const { jobId, ...updateData } = req.body
    
    if (!jobId)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const job = await Job.findOne({ _id: jobId, posted_by: req.user._id })

        if (!job)
            return res.status(404).send({ status: 'error', msg: 'Job not found' })

        updateData.timestamp = Date.now()

        const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, { new: true })

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
    const { jobId } = req.body

    if (!jobId)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const job = await Job.findOne({ _id: jobId, posted_by: req.user._id })

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
    const { jobId } = req.body

    if (!jobId)
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })

    try {
        const deleted = await Job.findOneAndDelete({ _id: jobId, posted_by: req.user._id })

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