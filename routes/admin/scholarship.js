const express = require("express")
const router = express.Router()

const Scholarship = require("../../models/scholarship")
const Organization = require("../../models/organization")
const User = require("../../models/user")
const authToken = require("../../middleware/authToken")


// ==========================
// 1. GET ALL SCHOLARSHIPS ON PLATFORM
// ==========================
router.post("/all", authToken, async (req, res) => {
    try {
        const scholars = await Scholarship.find()
            .populate("posted_by", "company_name firstname lastname email") // organization or user
            .sort({ createdAt: -1 })

        return res.status(200).send({ status: "ok", msg: "success", scholars })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 2. GET A SPECIFIC SCHOLARSHIP
// ==========================
router.post("/scholarship", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body

        if (!scholarshipId) {
            return res.status(400).send({ status: "error", msg: "Scholarship ID is required" })
        }

        const scholar = await Scholarship.findById(scholarshipId).populate("posted_by", "company_name firstname lastname email")

        if (!scholar) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", scholar })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


/*/ ==========================
// 3. APPROVE OR REJECT AN ORGANIZATION'S SCHOLARSHIP
// ==========================
router.post("/sch_status", authToken, async (req, res) => {
    try {
        const { scholarshipId, status } = req.body

        if (!scholarshipId || !status) {
            return res.status(400).send({ status: "error", msg: "All fields are required" })
        }

        const validStatus = ["approved", "rejected"]
        if (!validStatus.includes(status)) {
            return res.status(400).send({ status: "error", msg: "Invalid status value" })
        }

        const scholar = await Scholarship.findByIdAndUpdate(scholarshipId, { status }, { new: true })

        if (!scholar) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        return res.status(200).send({ status: "ok", msg: 'success', scholar })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})
*/


// ==========================
// 4. FORCE CLOSE OR REMOVE A SCHOLARSHIP
// ==========================
router.post("/close", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body

        if (!scholarshipId) {
            return res.status(400).send({ status: "error", msg: "Scholarship ID is required" })
        }

        const scholar = await Scholarship.findByIdAndUpdate(scholarshipId, { isClosed: true }, { new: true })

        if (!scholar) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", scholar })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


// ==========================
// 5. DELETE SCHOLARSHIP (FRAUD OR VIOLATION)
// ==========================
router.post("/delete", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body

        if (!scholarshipId) {
            return res.status(400).send({ status: "error", msg: "Scholarship ID is required" })
        }

        const scholar = await Scholarship.findByIdAndDelete(scholarshipId)

        if (!scholar) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success" })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: error.message })
    }
})


module.exports = router