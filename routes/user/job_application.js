const express = require("express")
const router = express.Router()

const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')

const Job = require("../../models/job")
const JobApplication = require("../../models/job_application")
const authToken = require("../../middleware/authToken") // your auth middleware


// ==========================
// 1. APPLY FOR A JOB
// ==========================
router.post("/apply", authToken, uploader.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 }
]), async (req, res) => {
    try {
        const { jobId, message } = req.body
        const userId = req.user._id

        if (!jobId) {
            return res.status(400).send({ status: "error", msg: "Job ID is required" })
        }

        // Confirm job exists
        const job = await Job.findById(jobId)
        if (!job) {
            return res.status(404).send({ status: "error", msg: "Job not found" })
        }

        // === Handle resume upload ===
        if (!req.files || !req.files.resume) {
            return res.status(400).send({ status: "error", msg: "Resume is required" })
        }

        const resumeUpload = await cloudinary.uploader.upload(req.files.resume[0].path, {
            folder: "job-applications/resumes"
        })

        const resume_cv = [{
            file_url: resumeUpload.secure_url,
            file_id: resumeUpload.public_id
        }]

        // === Handle cover letter upload (optional) ===
        let cover_letter = []
        if (req.files.coverLetter) {
            const coverLetterUpload = await cloudinary.uploader.upload(req.files.coverLetter[0].path, {
                folder: "job-applications/coverLetters"
            })
            cover_letter.push({
                file_url: coverLetterUpload.secure_url,
                file_id: coverLetterUpload.public_id
            })
        }

        // Create job application
        const application = new JobApplication({
            job_id: jobId,
            applicant_id: userId,
            message: message || "",
            resume_cv,
            cover_letter
        })

        await application.save()

        res.status(201).send({ status: "ok", msg: "success", application })

    } catch (error) {
        console.error(error)
        res.status(500).send({ status: "error", msg: "error occurred", error: error.message })
    }
})


// ==========================
// 2. GET ALL APPLICATIONS BY THE USER
// ==========================
router.post("/my_applications", authToken, async (req, res) => {
    try {
        const userId = req.user._id
        const applications = await JobApplication.find({ applicantId: userId })
            .populate("jobId", "title company_name location")
            .sort({ createdAt: -1 })

        return res.status(200).send({ status: "ok", msg: "success", applications })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 3. GET A SPECIFIC APPLICATION
// ==========================
router.post("/application", authToken, async (req, res) => {
    try {
        const { applicationId } = req.body
        const userId = req.user._id

        if (!applicationId) {
            return res.status(400).send({ status: "error", msg: "Application ID is required" })
        }

        const application = await JobApplication.findOne({ _id: applicationId, applicantId: userId })
            .populate("jobId", "title company_name location description")

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
// 4. WITHDRAW AN APPLICATION
// ==========================
router.post("/withdraw", authToken, async (req, res) => {
    try {
        const { applicationId } = req.body
        const userId = req.user._id

        if (!applicationId) {
            return res.status(400).send({ status: "error", msg: "Application ID is required" })
        }

        const application = await JobApplication.findOneAndDelete({ _id: applicationId, applicantId: userId })

        if (!application) {
            return res.status(404).send({ status: "error", msg: "Application not found or already withdrawn" })
        }

        return res.status(200).send({ status: "ok", msg: "success", application })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


module.exports = router