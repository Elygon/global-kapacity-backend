const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Training = require('../../models/training')
const isKIP = require('../../middleware/isKIP')
const { kipAcceptsTrainingMail, kipRejectsTrainingMail } = require('../../utils/nodemailer')


// =======================================================
// GET ALL TRAININGS ASSIGNED TO THIS KIP
// =======================================================
router.post('/all', authToken, isKIP, async (req, res) => {
    try {
        const trainings = await Training.find({ kip_id: req.kip._id })
        return res.status(200).send({ status: 'ok', msg: 'success', data: trainings })
    } catch (err) {
        return res.status(500).send({ status: "error", msg: "Server error", error: err.message })
    }
})


// =======================================================
// VERIFY TRAINING (KIP Accepts to Manage it)
// =======================================================
router.post('/verify', authToken, isKIP, async (req, res) => {
    const { trainingId } = req.body
    if (!trainingId) {
        return res.status(400).send({ status: 'error', msg: 'Training ID is required'})
    }

    try {
        const training = await Training.findOne({ _id: trainingId, kip_id: req.kip._id })
        .populate('posted_by', 'email firstname').populate('selected_kip', 'email organization_name')
        if (!training)
            return res.status(404).send({ status: "error", msg: "Training not found" })

        training.kip_status = 'verified'

        await training.save()

        // send emails
        await kipAcceptsTrainingMail(training.posted_by.email, training.posted_by.firstname, training.title)
        /*await trainingNotifyKipMail(training.selected_kip.email, training.selected_kip.organization_name, training.title)*/

        return res.send({ status: 'ok', msg: 'success', training })
    } catch (err) {
        res.status(500).send({ status: "error", msg: "Server error", error: err.message })
    }
})


// =======================================================
// REJECT TRAINING (With Reason)
// =======================================================
router.post('/reject', authToken, isKIP, async (req, res) => {
    const { trainingId, reason } = req.body

    if (!trainingId || !reason) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required'})
    }
    try {
        const training = await Training.findOne({ _id: trainingId, kip_id: req.kip._id })
        .populate('posted_by', 'email firstname').populate('selected_kip', 'email organization_name')

        if (!training)
            return res.status(404).send({ status: "error", msg: "Training not found" })

        training.kip_status = "rejected"
        training.kip_rejection_reason = reason

        await training.save()

        // send emails
        await kipRejectsTrainingMail(training.posted_by.email, training.posted_by.firstname, 
            training.title, training.kip_rejection_reason)
        /*await trainingNotifyKipMail(training.selected_kip.email, training.selected_kip.organization_name, training.title)*/

        return res.status(200).send({ status: 'ok', msg: "success", training })
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
        const training = await Training.findOne({ _id: trainingId, kip_id: req.kip._id })

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