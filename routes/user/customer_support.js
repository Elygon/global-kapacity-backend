const express = require('express')
const router = express.Router()

const Ticket = require('../../models/customer_support')
const mongoose = require('mongoose')
const authToken = require('../../middleware/authToken')


// create a new ticket (user raising a complaint)
router.post('/create', authToken, async(req, res) => {
    const { message } = req.body
    if (!message) {
        return res.status(400).send({ status: 'error', msg: 'Message is required' })
    }

    const userId = req.user._id // use logged-in user

    try {
        const newTicket = new Ticket({
            user_id: userId,
            messages: [{
                sender: 'User',
                sender_id: req.user._id,
                message
            }],
            status: 'Open'
        })

        await newTicket.save()

        res.status(201).send({ status: 'ok', msg: 'success', newTicket })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Reply to ticket (user sending additional message)
router.post('/reply', authToken, async(req, res) => {
    const { ticketId, message } = req.body
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid ticket ID' })
    }

    if (!message) {
        return res.status(400).send({ status: 'error', msg: 'Message is required' })
    }


    try {
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
            return res.status(404).send({ status: 'error', msg: 'Ticket not found' })
        }

        ticket.messages.push({
            sender: 'User',
            sender_id: userId,
            message
        })

        ticket.status = 'Pending Admin Response'

        await ticket.save()
        res.status(200).send({ status: 'ok', msg: 'success', ticket })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Get all tickets for this user
router.post('/all', authToken, async(req, res) => {
    const userId = req.user._id

    try {
        const tickets = await Ticket.find({ user_id: userId }).populate('user_id', 'name email').sort({ createdAt: -1 })

        res.status(200).send({ status: 'ok', msg: 'success', tickets })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Get specific ticket by ID
router.post('/view', authToken, async(req, res) => {
    const { ticketId } = req.body
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid ticket ID' })
    }

    try {
        const ticket = await Ticket.findById(ticketId).populate('user_id', 'name email')
        if (!ticket) {
            return res.status(404).send({ status: 'error', msg: 'Ticket not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', ticket })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


module.exports = router