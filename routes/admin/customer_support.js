const express = require('express')
const router = express.Router()

const Ticket = require('../../models/customer_support')
const mongoose = require('mongoose')
const authToken = require('../../middleware/authToken')


// Get all tickets
router.post('/all', authToken, async(req, res) => {
    const { status } = req.body // Open, Pending Admin Response, Closed

    const filter = {}
    if (status) filter.status = status

    try {
        const tickets = await Ticket.find(filter).populate('user_id', 'name email')
        .populate('organization_id', 'company_name email').sort({ createdAt: -1 })

        res.status(200).send({ status: 'ok', msg: 'success', tickets })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Get tickets waiting for admin response
router.post('/pending', authToken, async(req, res) => {
    try {
        const tickets = await Ticket.find({ status: 'Pending Admin Response' }).populate('user_id', 'name email')
        .populate('organization_id', 'company_name email').sort({ updatedAt: -1 })

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
        .populate('organization_id', 'company_name email')

        if (!ticket) {
            return res.status(404).send({ status: 'error', msg: 'Ticket not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', ticket })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Reply to ticket (Admin sending message)
router.post('/reply', authToken, async(req, res) => {
    const { ticketId, message } = req.body
    const adminId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid ticket ID' })
    }

    if (!message) {
        return res.status(400).send({ status: 'error', msg: 'Message cannot be empty' })
    }

    try {
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return res.status(404).send({ status: 'error', msg: 'Ticket not found' })
        }

        ticket.messages.push({
            sender: 'Admin',
            sender_id: adminId,
            senderRef: 'Admin',
            message
        })

        ticket.status = 'Pending User Response'
        ticket.assignedAdmin = adminId

        await ticket.save()
        res.status(200).send({ status: 'ok', msg: 'success', ticket })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Update ticket status manually
router.post('/status', authToken, async(req, res) => {
    const { ticketId, status } = req.body

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid ticket ID' })
    }

    try {
        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            return res.status(404).send({ status: 'error', msg: 'Ticket not found' })
        }

        ticket.status = status
        await ticket.save()

        res.status(200).send({ status: 'ok', msg: 'success', ticket })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


module.exports = router