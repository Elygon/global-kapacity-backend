const express = require("express")
const router = express.Router()

const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')

const Scholarship = require("../../models/scholarship")
const ScholarApplication = require("../../models/sch_application")
const authToken = require("../../middleware/authToken") // your auth middleware


// ==========================
// 1. APPLY FOR A SCHOLARSHIP
// ==========================
router.post("/apply", authToken, uploader.fields([
    { name: "recommendation_letter", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "video", maxCount: 1 }
]), async (req, res) => {
    try {
        const { scholarshipId, personal_statement } = req.body
        const userId = req.user._id

        if (!scholarshipId) {
            return res.status(400).send({ status: "error", msg: "Scholarship ID is required" })
        }

        // Confirm scholarship exists
        const scholarship = await Scholarship.findById(scholarshipId)
        if (!scholarship) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        // === Handle recommendation letter upload ===
        if (!req.files || !req.files.recommendation_letter) {
            return res.status(400).send({ status: "error", msg: "Recommendation letter is required" })
        }

        const recLetterUpload = await cloudinary.uploader.upload(req.files.recommendation_letter[0].path, {
            folder: "scholarship-applications/recommendation_letters"
        })
        const recommendation_letter = [{
            file_url: recLetterUpload.secure_url,
            file_id: recLetterUpload.public_id
        }]

        // === Handle resume upload ===
        if (!req.files.resume) {
            return res.status(400).send({ status: "error", msg: "Resume is required" })
        }

        const resumeUpload = await cloudinary.uploader.upload(req.files.resume[0].path, {
            folder: "scholarship-applications/resumes"
        })
        const resume = [{
            file_url: resumeUpload.secure_url,
            file_id: resumeUpload.public_id
        }]

        // === Handle video upload (optional) ===
        let video = []
        if (req.files.video) {
            const videoUpload = await cloudinary.uploader.upload(req.files.video[0].path, {
                folder: "scholarship-applications/video"
            })
            video.push({
                file_url: videoUpload.secure_url,
                file_id: videoUpload.public_id
            })
        }

        // === Create scholarship application ===
        const application = new ScholarApplication({
            scholarship_id: scholarshipId,
            applicant_id: userId,
            personal_statement: personal_statement || "",
            recommendation_letter,
            resume,
            video
        })

        await application.save()

        res.status(201).send({ status: "ok", msg: "success", application })

    } catch (error) {
        console.error(error)
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 2. GET ALL APPLICATIONS BY THE USER
// ==========================
router.post("/my_applications", authToken, async (req, res) => {
    try {
        const userId = req.user._id
        const applications = await ScholarApplication.find({ applicantId: userId })
            .populate("scholarshipId", "title university")
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

        const application = await ScholarApplication.findOne({ _id: applicationId, applicantId: userId })
            .populate("scholarshipId", "title university description")

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
// 4. WITHDRAW SCHOLARSHIP APPLICATION
// ==========================
router.post("/withdraw", authToken, async (req, res) => {
    try {
        const { applicationId } = req.body
        const userId = req.user._id

        if (!applicationId) {
            return res.status(400).send({ status: "error", msg: "Application ID is required" })
        }

        const application = await ScholarApplication.findOneAndDelete({ _id: applicationId, applicantId: userId })

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