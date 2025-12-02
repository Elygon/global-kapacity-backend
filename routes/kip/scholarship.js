const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Scholarship = require('../../models/scholarship')
const isKIP = require('../../middleware/isKIP')
const { kipAcceptsScholarshipMail, kipRejectsScholarshipMail } = require('../../utils/nodemailer')


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
        .populate('posted_by', 'email firstname').populate('selected_kip', 'email organization_name')
        if (!scholarship)
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })

        scholarship.kip_status = 'verified'

        await scholarship.save()

        // send emails
        await kipAcceptsScholarshipMail(scholarship.posted_by.email, scholarship.posted_by.firstname, scholarship.title)
        /*await trainingNotifyKipMail(training.selected_kip.email, training.selected_kip.organization_name, training.title)*/

        return res.send({ status: 'ok', msg: 'success', scholarship })
    } catch (err) {
        res.status(500).send({ status: "error", msg: "Server error", error: err.message })
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
        .populate('posted_by', 'email firstname').populate('selected_kip', 'email organization_name')

        if (!scholarship)
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })

        scholarship.kip_status = "rejected"
        scholarship.kip_rejection_reason = reason

        await scholarship.save()

        // send emails
        await kipRejectsScholarshipMail(scholarship.posted_by.email, scholarship.posted_by.firstname, 
            scholarship.title, scholarship.kip_rejection_reason)
        /*await trainingNotifyKipMail(training.selected_kip.email, training.selected_kip.organization_name, training.title)*/

        return res.status(200).send({ status: 'ok', msg: "success", training: scholarship })
    } catch (err) {
        res.status(500).send({ status: "error", msg: "Server error", error: err.message })
    }
})


// =======================================================
// MARK TRAINING AS COMPLETED (Managed Successfully)
// =======================================================
router.post('completed', authToken, isKIP, async (req, res) => {
    const { scholarshipId } = req.body
    if (!scholarshipId) {
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required'})
    }

    try {
        const scholarship = await Scholarship.findOne({ _id: scholarshipId, kip_id: req.kip._id })

        if (!scholarship)
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })

        if (scholarship.kip_status !== "verified")
            return res.status(400).send({ status: "error", msg: "Scholarship must be verified before completing it."
        })

        scholarship.kip_status = 'completed'
        await scholarship.save()

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship })
    } catch (err) {
        return res.status(500).send({ status: "error", msg: "Server error", error: err.message })
    }
})

module.exports = router