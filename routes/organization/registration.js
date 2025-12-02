const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Training = require('../../models/training')
const Registration = require('../../models/registration')
const { isPremiumUser } = require("../../middleware/opportunityPost")



// =========================================
// GET ALL ATTENDEES THAT REGISTERED FOR THEIR TRAINING
// =========================================
router.post('/attendees', authToken, isPremiumUser, async (req, res) => {
    const { trainingId } = req.body
    if (!trainingId) {
        return res.status(400).send({ status: 'error', msg: 'Training ID is required' })
    }

    try {
        // Verify the training belongs to the logged-in organization
        const training = await Training.findOne({ _id: trainingId, posted_by: req.user._id })
        if (!training)
            return res.status(404).send({ status: 'error', msg: 'Training not found' })

        // Get all registrations for that training
        const attendees = await Registration.find({ training: trainingId }).sort({ createdAt: -1 })

        if (!attendees.length)
            return res.status(200).send({ status: 'ok', msg: 'No attendees found' })

        return res.status(200).send({ status: 'ok', msg: 'success', count: attendees.length, attendees })

    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// DETAILS OF A SPECIFIC REGISTERED ATTENDEE FOR THEIR TRAINING
// =========================================
router.post('/attendee', authToken, isPremiumUser, async (req, res) => {
    const { trainingId, regId } = req.body

    if (!trainingId || !regId)
        return res.status(400).send({ status: 'error', msg: 'All fields are required' })

    try {
       // Verify the training belongs to the logged-in organization
        const training = await Training.findOne({ _id: trainingId, posted_by: req.user._id })
        if (!training)
            return res.status(404).send({ status: 'error', msg: 'Training not found' })

         // Find the specific registration
        const registration = await Registration.findOne({ _id: regId, training: trainingId })
        if (!registration)
            return res.status(404).send({ status: 'error', msg: 'Attendee not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', attendee: registration })

    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})


module.exports = router