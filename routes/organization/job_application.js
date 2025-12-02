const express = require("express")
const router = express.Router()

const authToken = require("../../middleware/authToken")
const { isPremiumOrg } = require("../../middleware/opportunityPost")
const Job = require("../../models/job")
const JobApplication = require("../../models/job_application")



// ==========================
// 1. GET ALL APPLICANTS FOR A SPECIFIC JOB
// ==========================
router.post("/applicants", authToken, isPremiumOrg, async (req, res) => {
    try {
        const { jobId } = req.body
        const orgId = req.user._id

        // Confirm this job belongs to the organization
        const job = await Job.findOne({ _id: jobId, postedBy: orgId })
        if (!job) {
            return res.status(404).send({ status: 'error', msg: "Job not found" })
        }

        const applicants = await JobApplication.find({ jobId })
        .populate({ path: "applicantId", select: 'firstname lastname email phone_no',
            populate: { path: 'profile', select: 'profile_img_url' }
        })

        res.status(200).send({ status: 'ok', msg: "Applicants fetched successfully", applicants })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// 2. GET A SINGLE APPLICANT APPLICATION
// ==========================
router.post("/applicant", authToken, isPremiumOrg, async (req, res) => {
    try {
        const { jobId, applicationId } = req.body
        const orgId = req.user._id

        const job = await Job.findOne({ _id: jobId, postedBy: orgId })
        if (!job) {
            return res.status(404).send({ status: 'error', msg: "Job not found" })
        }

        const application = await JobApplication.findOne({ _id: applicationId, jobId})
        .populate({ path: "applicantId", select: 'firstname lastname email phone_no about',
            populate: { path: 'profile', select: 'profile_img_url' }
        })

        if (!application) {
            return res.status(404).send({ status: 'error', msg: "Application not found." })
        }

        res.status(200).send({ status: 'ok', msg: "success", application })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// 3. UPDATE APPLICATION STATUS
// ==========================
router.post("/applicant_status", authToken, isPremiumOrg, async (req, res) => {
    try {
        const { jobId, applicationId, status } = req.body
        const orgId = req.user._id

        const validStatus = [ 'Interview', 'Rejected', 'Pending', 'Offer' ]
        if (!validStatus.includes(status)) {
            return res.status(400).send({ status: 'error', msg: "Invalid status value" })
        }

        const job = await Job.findOne({ _id: jobId, postedBy: orgId })
        if (!job) {
            return res.status(404).send({ status: 'error', msg: "Job not found" })
        }

        const updated = await JobApplication.findOneAndUpdate({ _id: applicationId, jobId }, { status }, { new: true })

        if (!updated) {
            return res.status(404).send({ status: 'error' , msg: "Application not found" })
        }

        res.status(200).send({ status: 'ok', msg: "success", application: updated })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// 4. DOWNLOAD APPLICANT CV
// ==========================
router.post("/applicant_cv", authToken, isPremiumOrg, async (req, res) => {
    try {
        const { jobId, applicationId } = req.body
        const orgId = req.user._id

        const job = await Job.findOne({ _id: jobId, postedBy: orgId })
        if (!job) {
            return res.status(404).send({ status: 'error', msg: "Job not found" })
        }

        const application = await JobApplication.findOne({ _id: applicationId, jobId })

        if (!application) {
            return res.status(404).send({ status: 'error', msg: "Application not found." })
        }

        if (!application.resumeURL) {
            return res.status(400).send({ status: 'error', msg: "Applicant did not upload any CV" })
        }

        return res.redirect(application.resumeURL)

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


module.exports = router