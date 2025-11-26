const express = require("express")
const router = express.Router()

const Job = require("../../models/job")
const SavedJob = require("../../models/saved_job")
const authToken = require("../../middleware/authToken")
const { getDateFromPeriod } = require("../../functions/dateGetter")
const { preventFreemiumDetailView } = require("../../middleware/freemiumlimit")


// ==========================
// 1. Browse all jobs
// ==========================
router.post("/browse", /*authToken,*/ async (req, res) => {
    /*const { pagec } = req.body

    // validate page number
    if (!pagec || typeof pagec !== 'number' || pagec < 1) {
        return res.status(400).send({ status: 'error', msg: 'pagec is required'})
    }*/
    try {
        // fetch jobs with pagination
        const jobs = await Job.find().sort({ createdAt: -1 })/*.skip((pagec - 1) * 10).limit(10).lean()

        if(jobs.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No Jobs found', count: 0, jobs: []})
        }*/

        res.status(200).send({ status: "ok", msg: "success", /*count: jobs.length,*/ jobs })
    } catch (error) {
        res.status(500).send({ status: "error", message: "Server error", error: error.message })
    }
})


// ==========================
// 2. Search / Filter jobs
// =======================
router.post("/search", /* authToken, */ async (req, res) => {
    try {
        const {
            keyword,        // search by job title or company name
            job_type,
            experience_level,
            industry,
            date_posted     // all, last_24_hours, last_3_days, last_7_days, last_14_days, last_30_days, over_1_month
        } = req.body

        const filter = {}

        // Keyword search on job title or company name
        if (keyword) {
            filter.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { company_name: { $regex: keyword, $options: "i" } }
            ]
        }

        // Filters
        if (job_type) filter.job_type = job_type
        if (experience_level) filter.experience_level = experience_level
        if (industry) filter.industry = industry

        // Date posted filter
        if (date_posted && date_posted !== "all") {
            const dateLimit = getDateFromPeriod(date_posted)
            if (dateLimit === "over_1_month") {
                // jobs older than 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                filter.createdAt = { $lt: thirtyDaysAgo }
            } else if (dateLimit) {
                filter.createdAt = { $gte: dateLimit }
            }
        }

        const jobs = await Job.find(filter).sort({ createdAt: -1 })

        res.status(200).send({ status: "ok", msg: "success", jobs })

    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 3. View single job
// ==========================
router.post("/view",  authToken, preventFreemiumDetailView, async (req, res) => {
    try {
        const { jobId } = req.body

        const job = await Job.findById(jobId)
        if (!job) return res.status(404).send({ status: "error", msg: "Job not found" })

        res.status(200).send({ status: "ok", msg: "success", job })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 4. Save a job
// ==========================
router.post("/save", authToken, preventFreemiumDetailView, async (req, res) => {
    try {
        const { jobId } = req.body
        const userId = req.user._id

        // Check if already saved
        const existing = await SavedJob.findOne({ userId, jobId })
        if (existing) {
            return res.status(400).send({ status: "error", msg: "Job already saved" })
        }

        const savedJob = new SavedJob({ userId, jobId })
        await savedJob.save()

        res.status(200).send({ status: "ok", msg: "success", savedJob })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 5. Unsave a job
// ==========================
router.post("/unsave", authToken, preventFreemiumDetailView, async (req, res) => {
    try {
        const { jobId } = req.body // the job to unsave
        const userId = req.user._id

        if (!jobId) {
            return res.status(400).send({ status: 'error', msg: 'Job ID is required' })
        }

        // Remove the job from the user's saved jobs array
        const updatedUser = await User.findByIdAndUpdate( userId, 
            { $pull: { savedJobs: jobId }}, // assumes saved jobs is an array of ObjectIds
            { new: true }
        )

        return res.status(200).send({ status: "ok", msg: "success", savedJobs: updatedUser.savedJobs })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 6. List saved jobs
// ==========================
router.post("/saved", authToken, preventFreemiumDetailView, async (req, res) => {
    try {
        const userId = req.user._id
        const savedJobs = await SavedJob.find({ userId }).populate("jobId").sort({ createdAt: -1 })

        if (!savedJobs.length) {
            return res.status(200).send({ status: 'ok', msg: 'You haven\'t saved any job yet', count: 0 })
        }

        res.status(200).send({ status: "ok", msg: "success", count: savedJobs.length, savedJobs })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


module.exports = router