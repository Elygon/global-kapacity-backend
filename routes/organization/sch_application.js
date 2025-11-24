const express = require("express")
const router = express.Router()

const authToken = require("../../middleware/authToken")
const scholarship = require("../../models/scholarships")
const scholarApplication = require("../../models/sch_application")



// ==========================
// 1. GET ALL APPLICANTS FOR A SPECIFIC SCHOLARSHIP
// ==========================
router.post("/applicants", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body
        const orgId = req.user._id

        // Confirm this job belongs to the organization
        const scholar = await scholarship.findOne({ _id: scholarshipId, postedBy: orgId })
        if (!scholar) {
            return res.status(404).send({ status: 'error', msg: "Job not found" })
        }

        const applicants = await scholarApplication.find({ scholarshipId })
        .populate({ path: "applicantId", select: 'firstname lastname email phone_no',
            populate: { path: 'profile', select: 'profile_img_url' }
        })

        res.status(200).send({ status: 'ok', msg: "success", applicants })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// 2. GET A SINGLE APPLICANT APPLICATION
// ==========================
router.post("/applicant", authToken, async (req, res) => {
    try {
        const { scholarshipId, applicationId } = req.body
        const orgId = req.user._id

        const scholar = await scholarship.findOne({ _id: scholarshipId, postedBy: orgId })
        if (!scholar) {
            return res.status(404).send({ status: 'error', msg: "Scholarship not found" })
        }

        const application = await scholarApplication.findOne({ _id: applicationId, scholarshipId})
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
router.post("/applicant_status", authToken, async (req, res) => {
    try {
        const { scholarshipId, applicationId, status } = req.body
        const orgId = req.user._id

        const validStatus = [ 'Interview', 'Rejected', 'Pending', 'Offer' ]
        if (!validStatus.includes(status)) {
            return res.status(400).send({ status: 'error', msg: "Invalid status value" })
        }

        const job = await scholarship.findOne({ _id: scholarshipId, postedBy: orgId })
        if (!job) {
            return res.status(404).send({ status: 'error', msg: "Scholarship not found" })
        }

        const updated = await scholarApplication.findOneAndUpdate({ _id: applicationId, scholarshipId }, { status }, { new: true })

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
router.post("/applicant_cv", authToken, async (req, res) => {
    try {
        const { scholarshipId, applicationId } = req.body
        const orgId = req.user._id

        const scholar = await scholarship.findOne({ _id: scholarshipId, postedBy: orgId })
        if (!scholar) {
            return res.status(404).send({ status: 'error', msg: "Scholarship not found" })
        }

        const application = await scholarApplication.findOne({ _id: applicationId, scholarshipId })

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