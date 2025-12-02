const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Training = require('../../models/training')
const Registration = require('../../models/registration')


// -------------------------------
// Register for a Training
// -------------------------------
router.post('/register', authToken, async (req, res) => {
    const { trainingId, firstname, lastname, email, phone_no, attendance_mode,   // for hybrid
        attendee_type,       // ticket category name
        fee, currency, reg_method 
    } = req.body
    if (!trainingId || !firstname || !lastname || !email || !phone_no) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required'})
    }

    try {
        const training = await Training.findById(trainingId)
        if (!training) return res.status(404).send({ status: 'error', msg: 'Training not found' })

        // 1. Create Registration (pending until payment verifies)
        const registration = await Registration.create({
            user: req.user ? req.user._id : null,   // optional: user might be logged in
            training: trainingId,
            firstname,
            lastname,
            email,
            phone_no,
            attendance_mode: attendance_mode || null,
            attendee_type: attendee_type || null,
            fee: fee || 0,
            currency: currency || null,
            reg_method: reg_method || 'kapacity',
            is_paid: training.reg?.is_paid ? true : false,
            status: training.reg?.is_paid ? 'pending' : 'completed',
        })

        // -------------------------------
        // FREE REGISTRATION FLOW
        // -------------------------------
        if (!training.reg?.is_paid) {
            // free training

            // If training is virtual/hybrid → attach link if admin approved
            if (training.training_mode !== 'In-Person' && training.training_link) {
                registration.training_link = training.training_link
                await registration.save()
            }

            return res.status(200).send({ status: 'ok', msg: 'success', registration})
        } 
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// -------------------------------
// VIEW MY REGISTRATIONS
// -------------------------------
router.post('/my_regs', authToken, async(req, res) => {
    try {
        const regs = await Registration.find({ user: req.user._id }).populate({ path: 'training', 
            select: 'title training_type training_mode date time banner_img' }).sort({ createdAt: -1 })
        if (regs.length === 0) return res.status(200).send({ status: "ok", msg: "No registrations found" })

        return res.status(200).send({ status: 'ok', msg: 'success', count: regs.length, regs })
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Server error', error: err.message })
    }
})


// -------------------------------
// VIEW SINGLE REGISTRATION
// -------------------------------
router.post('/my_reg', authToken, async(req, res) => {
    const { regId } = req.body
    if (!regId) {
        return res.status(400).send({ status: 'error', msg: 'Registration ID is required'})
    }

    try {
        const reg = await Registration.findById(regId).populate({ path: 'training', 
            select: 'title description training_type training_mode date time banner_img training_link' })
        if (!reg) return res.status(404).send({ status: "error", msg: "Registration not found" })

        //Prevent user fro seeing others' registrations
        if (reg.user && reg.user.toString() !== req.user._id.toString()) {
            return res.status(403).send({ status: 'error', msg: 'Unauthorized: Not your registration'})
        }

        return res.status(200).send({ status: 'ok', msg: 'success', reg })
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Server error', error: err.message })
    }
})


// -------------------------------
// CANCEL A REGISTRATION
// -------------------------------
router.post('/cancel', authToken, async(req, res) => {
    const { regId } = req.body
    if (!regId) {
        return res.status(400).send({ status: 'error', msg: 'Registration ID is required'})
    }

    try {
        const reg = await Registration.findById(regId).populate('training')
        if (!reg) {
            return res.status(404).send({ status: "error", msg: 'Registration not found' })
        }
        
        // Ensure the registation belongs to the user
        if (reg.user.toString() !== req.user._id.toString()) {
            return res.status(403).send({ status: 'error', msg: 'Unauthorized: You cannot cancel this registration'})
        }

        // Prevent cancellation after training has started
        const now = new Date()
        if (reg.training.date && reg.training.date <= now) {
            return res.status(400).send({ status: 'error', msg: 'Cannot be cancelled'})
        }

        /// Prevent cancelling completed & paid registrations
        if (reg.training.status === 'completed' && reg.is_paid <= now) {
            return res.status(400).send({ status: 'error', msg: 'Cannot be cancelled'})
        }

        // Cancel registration
        await Registration.findByIdAndDelete(regId)

        return res.status(200).send({ status: 'ok', msg: 'success', reg })
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Server error', error: err.message })
    }
})


module.exports = router