const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Scholarship = require('../../models/scholarship')
const isKIP = require('../../middleware/isKIP')


// =======================================================
// GET ALL SCHOLARSHIPS ASSIGNED TO THIS KIP
// =======================================================
router.post('/all', authToken, isKIP, async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ kip_id: req.kip._id })
        return res.status(200).send({ status: 'ok', msg: 'success', data: scholarships })
    } catch (err) {
        return res.status(500).send({ status: "error", msg: "Server error", error: err.message })
    }
})


// =======================================================
// VERIFY SCHOLARSHIP (KIP Accepts to Manage it)
// =======================================================
router.post('/verify', authToken, isKIP, async (req, res) => {
    const { scholarshipId } = req.body
    if (!scholarshipId) {
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required'})
    }

    try {
        const scholarship = await Scholarship.findOne({ _id: scholarshipId, kip_id: req.kip._id })
        if (!scholarship)
            return res.status(404).json({ status: "error", msg: "Scholarship not found" })

        scholarship.kip_status = 'verified'

        await scholarship.save()

        return res.send({ status: 'ok', msg: 'success', scholarship })
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Server error", error: err.message })
    }
})


// =======================================================
// REJECT SCHOLARSHIP (With Reason)
// =======================================================
router.post('/reject', authToken, isKIP, async (req, res) => {
    const { scholarshipId, reason } = req.body

    if (!scholarshipId || !reason) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required'})
    }
    try {
        const scholarship = await Scholarship.findOne({ _id: scholarshipId, kip_id: req.kip._id })

        if (!scholarship)
            return res.status(404).send({ status: "error", msg: "Training not found" })

        scholarship.kip_status = "rejected"
        scholarship.kip_rejection_reason = reason

        await scholarship.save()

        return res.status(200).send({ status: 'ok', msg: "success", scholarship })
    } catch (err) {
        res.status(500).send({ status: "error", msg: "Server error", error: err.message })
    }
})


// =======================================================
// MARK TRAINING AS COMPLETED (Managed Successfully)
// =======================================================
router.post('completed', authToken, isKIP, async (req, res) => {
    const { trainingId } = req.body
    if (!trainingId) {
        return res.status(400).send({ status: 'error', msg: 'Training ID is required'})
    }

    try {
        const training = await Scholarship.findOne({ _id: trainingId, kip_id: req.kip._id })

        if (!training)
            return res.status(404).send({ status: "error", msg: "Training not found" })

        if (training.kip_status !== "verified")
            return res.status(400).send({ status: "error", msg: "Training must be verified before completing it."
        })

        training.kip_status = 'completed'
        await training.save()

        return res.status(200).send({ status: 'ok', msg: 'success', training })
    } catch (err) {
        return res.status(500).send({ status: "error", msg: "Server error", error: err.message })
    }
})

module.exports = router