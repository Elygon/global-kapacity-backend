const express = require("express")
const router = express.Router()

const JobApplication = require("../../models/job_application")
const Job = require("../../models/job")
const User = require("../../models/user")
const Organization = require("../../models/organization")
const authToken = require("../../middleware/authToken")



// ==========================
// 1. GET ALL APPLICATIONS ON PLATFORM
// ==========================
router.post("/all", authToken, async (req, res) => {
    try {
        const apps = await JobApplication.find()
            .populate("jobId", "title description responsibilities requirements preferred_skills deadline posted_by")
            .populate("applicantId", "firstname lastname email phone_no profile_img_url")
            .sort({ createdAt: -1 })

        if (!apps.length) {
            return res.status(200).send({ status: 'ok', msg: 'No applications found.', count: 0 })
        }

        return res.status(200).send({ status: "ok", msg: "success", count: apps.length, apps })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 2. GET APPLICATIONS FOR A SPECIFIC JOB
// ==========================
router.post("/application", authToken, async (req, res) => {
    const {jobId} = req.body
    if (!jobId) {
        return res.status(400).send({ status: 'error', msg: 'Job ID is required' })
    }

    try {
        const job = await Job.findById(jobId)
        if (!job) {
            return res.status(404).send({ status: "error", msg: "Job not found" })
        }

        const apps = await JobApplication.findById({ job_id: jobId })
        .populate("applicantId", "firstname lastname email phone_no profile_img_url")
        
        if (!apps.length) {
            return res.status(200).send({ status: 'ok', msg: 'No applications found.', count: 0 })
        }

        return res.status(200).send({ status: "ok", msg: "success", count: apps.length, apps })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 3. GET APPLICATIONS by A SPECIFIC USER
// ==========================
router.post("/application", authToken, async (req, res) => {
    const {userId} = req.body
    if (!userId) {
        return res.status(400).send({ status: 'error', msg: 'User ID is required' })
    }

    try {
        const apps = await JobApplication.findById({ applicant_id: userId })
        .populate("jobId", "title description responsibilities requirements preferred_skills deadline posted_by")

        if (!apps.length) {
            return res.status(200).send({ status: 'ok', msg: 'No applications found.', count: 0 })
        }

        return res.status(200).send({ status: "ok", msg: "success", count: apps.length, apps })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})



// ==========================
// 2. VIEW A SPECIFIC APPLICATION
// ==========================
router.post("/application", authToken, async (req, res) => {
    try {
        const { applicationId } = req.body

        if (!applicationId) {
            return res.status(400).send({ status: "error", msg: "Application ID is required" })
        }

        const application = await JobApplication.findById(applicationId)
            .populate("jobId", "title postedBy")
            .populate("applicantId", "fullName email phone_number profile_img_url about")

        if (!application) {
            return res.status(404).send({ status: "error", msg: "Application not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", application })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 3. FLAG APPLICATION (Suspicious Activity)
// ==========================
router.post("/flag", authToken, async (req, res) => {
    try {
        const { applicationId, flag_reason } = req.body

        if (!applicationId || !flag_reason) {
            return res.status(400).json({ status: "error", msg: "All fields are required" })
        }

        const application = await JobApplication.findByIdAndUpdate(
            applicationId,
            { flagged: true, flag_reason },
            { new: true }
        )

        if (!application) {
            return res.status(404).send({ status: "error", msg: "Application not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", application })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})



// ==========================
// 4. LIST OF FLAGGED APPLICATIONS
// ==========================
router.post('/flagged', authToken, async (req, res) => {
    try {
        // Fetch all flagged applications
        const flagged = await JobApplication.find({ is_flagged: true })
            .populate('jobId', 'title posted_by')
            .populate('applicant_id', 'firstname lastname email phone_no profile_img_url').sort({ createdAt: -1 })

        if (flagged.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No flagged applications found', blocked: [] })
        }

        res.status(200).send({ status: 'ok', msg: 'success', count: flagged.length, flagged })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// ==========================
// 5. DELETE APPLICATION (Fraud or Spam)
// ==========================
router.post("/delete", authToken, async (req, res) => {
    try {
        const { applicationId } = req.body

        if (!applicationId) {
            return res.status(400).send({ status: "error", msg: "Application ID is required" })
        }

        const application = await JobApplication.findByIdAndDelete(applicationId)

        if (!application) {
            return res.status(404).send({ status: "error", msg: "Application not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success" })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


module.exports = router