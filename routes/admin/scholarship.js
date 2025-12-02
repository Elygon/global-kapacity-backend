const express = require("express")
const router = express.Router()

const Scholarship = require("../../models/scholarship")
const Organization = require("../../models/organization")
const User = require("../../models/user")
const authToken = require("../../middleware/authToken")
const { scholarshipApprovalMail, scholarshipRejectionMail, scholarshipHiddenMail } = require('../../utils/nodemailer')


// ==========================
// 1. GET ALL SCHOLARSHIPS ON PLATFORM (INCLUDING NON-VISIBLE SCHOLARSHIP)
// ==========================
router.post("/all", authToken, async (req, res) => {
    try {
        const scholarships = await Scholarship.find()
            .populate("posted_by", "company_name firstname lastname email") // organization or user
            .sort({ createdAt: -1 }) //.populate('OrganzationId')

        return res.status(200).send({ status: "ok", msg: "success", scholarships })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})



// ==========================
// 2. GET ONLY VISIBLE SCHOLARSHIPS
// ==========================
router.post("/visible", authToken, async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ is_visible: true })

        return res.status(200).send({ status: "ok", msg: "success", scholarships })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})



// ==========================
// 3. GET ONLY HIDDEN JOBS (ADMIN REVIEW QUEUE)
// ==========================
router.post("/hidden", authToken, async (req, res) => {
    try {
        const jobs = await Scholarship.find({ is_visible: false })

        return res.status(200).send({ status: "ok", msg: "success", jobs })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 4. GET A SPECIFIC JOB
// ==========================
router.post("/specific", authToken, async (req, res) => {
    try {
        const { jobId } = req.body

        if (!jobId) {
            return res.status(400).send({ status: "error", msg: "Job ID is required" })
        }

        const job = await Scholarship.findById(jobId).populate("posted_by", "company_name firstname lastname email")

        if (!job) {
            return res.status(404).send({ status: "error", msg: "Job not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", job })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 5. APPROVE A JOB LISTING (ADMIN SETS IT LIVE)
// ==========================
router.post("/approve", authToken, async (req, res) => {
    const { jobId } = req.body
    
    try {
        const job = await Scholarship.findById(jobId).populate('posted_by', 'company_name email')
        
        if (!job) {
            return res.status(404).send({ status: 'error', msg: 'Job not found' })
        }
        
        // Update visibility
        job.is_visible = true
        await job.save()
        
        // Extract values for mail
        const email = job.posted_by.email
        const company_name = job.posted_by.company_name
        const title = job.title

        // Send Job Approval Email
        await scholarshipApprovalMail(email, company_name, title)

        return res.status(200).send({ status: "ok", msg: 'success', job })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 6. REJECT A JOB LISTING (STILL HIDDEN BUT FLAGGED)
// ==========================
router.post("/reject", authToken, async (req, res) => {
    const { jobId, reason } = req.body
    
    try {
        const job = await Scholarship.findById(jobId).populate('posted_by', 'company_name email')

        if (!job) {
            return res.status(404).send({ status: 'error', msg: 'Job not found' })
        }

        // Update visibility
        job.is_visible = false
        job.rejection_reason = reason || 'Not specified'
        await job.save()
        
        // Extract values for mail
        const email = job.posted_by.email
        const company_name = job.posted_by.company_name
        const title = job.title

        // Send Job Rejection Email
        await scholarshipRejectionMail(email, company_name, title, reason)

        return res.status(200).send({ status: "ok", msg: 'success', job })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 7. HIDE A PREVIOUSLY APPROVED JOB
// ==========================
router.post("/hide", authToken, async (req, res) => {
    const { jobId } = req.body    
    
    try {
        const job = await Scholarship.findById(jobId).populate('posted_by', 'company_name email')

        if (!job) {
            return res.status(404).send({ status: "error", msg: "Job not found" })
        }

        // Update visibility
        job.is_visible = false
        await job.save()
        
        // Extract values for mail
        const email = job.posted_by.email
        const company_name = job.posted_by.company_name
        const title = job.title

        // Send Job Hidden Email
        await scholarshipHiddenMail(email, company_name, title)

        return res.status(200).send({ status: "ok", msg: "success", job })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 8. DELETE JOB (FRAUD OR VIOLATION)
// ==========================
router.post("/delete", authToken, async (req, res) => {
    const { jobId } = req.body
        
    try {
        const job = await Scholarship.findByIdAndDelete(jobId)

        return res.status(200).send({ status: "ok", msg: "success", job })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


module.exports = router