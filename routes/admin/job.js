const express = require("express")
const router = express.Router()

const Job = require("../../models/job")
const Organization = require("../../models/organization")
const User = require("../../models/user")
const authToken = require("../../middleware/authToken")


// ==========================
// 1. GET ALL JOBS ON PLATFORM
// ==========================
router.post("/all", authToken, async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("posted_by", "company_name firstname lastname email") // organization or user
            .sort({ createdAt: -1 })

        return res.status(200).send({ status: "ok", msg: "success", jobs })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 2. GET A SPECIFIC JOB
// ==========================
router.post("/job", authToken, async (req, res) => {
    try {
        const { jobId } = req.body

        if (!jobId) {
            return res.status(400).send({ status: "error", msg: "Job ID is required" })
        }

        const job = await Job.findById(jobId).populate("posted_by", "company_name firstname lastname email")

        if (!job) {
            return res.status(404).send({ status: "error", msg: "Job not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", job })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


/*/ ==========================
// 3. APPROVE OR REJECT AN ORGANIZATION'S JOB POSTING
// ==========================
router.post("/job_status", authToken, async (req, res) => {
    try {
        const { jobId, status } = req.body

        if (!jobId || !status) {
            return res.status(400).send({ status: "error", msg: "All fields are required" })
        }

        const validStatus = ["approved", "rejected"]
        if (!validStatus.includes(status)) {
            return res.status(400).send({ status: "error", msg: "Invalid status value" })
        }

        const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true })

        if (!job) {
            return res.status(404).send({ status: "error", msg: "Job not found" })
        }

        return res.status(200).send({ status: "ok", msg: 'success', job })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})
*/


// ==========================
// 4. FORCE CLOSE OR REMOVE A JOB
// ==========================
router.post("/job/close", authToken, async (req, res) => {
    try {
        const { jobId } = req.body

        if (!jobId) {
            return res.status(400).send({ status: "error", msg: "Job ID is required" })
        }

        const job = await Job.findByIdAndUpdate(jobId, { isClosed: true }, { new: true })

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
// 5. DELETE JOB (FRAUD OR VIOLATION)
// ==========================
router.post("/job", authToken, async (req, res) => {
    try {
        const { jobId } = req.body

        if (!jobId) {
            return res.status(400).send({ status: "error", msg: "Job ID is required" })
        }

        const job = await Job.findByIdAndDelete(jobId)

        if (!job) {
            return res.status(404).send({ status: "error", msg: "Job not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success" })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


module.exports = router