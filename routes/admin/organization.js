const express = require("express")
const router = express.Router()

const dotenv = require("dotenv");
dotenv.config()

const Organization = require('../../models/organization')
const authToken = require('../../middleware/authToken')



// View all organizations account
router.post("/all", authToken, async (req, res) => {
    try {
        const orgs = await Organization.find().sort({ timestamp: -1 })
        if (orgs.length === 0) return res.status(200).send({ status: "ok", msg: "No organzations found" })

        return res.status(200).send({ status: "ok", msg: 'success', count: orgs.length, orgs })

    } catch (e) {
        if (e.name === "JsonWebTokenError") {
            return res.status(400).send({ status: "error", msg: "Token verification failed", error: e.message })
        }
        return res.status(500).send({ status: "error", msg: "Error occurred", error: e.message })
    }
})


// View single organization account 
router.post('/view', authToken, async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).send({ status: 'error', msg: 'Organization ID is required' })
    }

    try {
        const org = await Organization.findById(id)
        if (!org) return res.status(404).send({ status: 'error', msg: 'Organization not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', org })
    } catch (e) {
        if (e.name === 'JsonWebTokenError') {
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })
        }
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Search for organization accounts
router.post("/search", authToken, async (req, res) => {
    const { name} = req.body

    if (!name) {
        return res.status(400).send({status:'error', msg: 'Name is required'})
    }

    try {
        // Find organization accounts
        const orgs = await Organization.find({
            name: { $regex: name, $options: "i" }
        }).sort({date_added: -1})

        if (!orgs || orgs.length === 0) {
            return res.status(200).send({ status: 'ok', msg: "No organizations found", count: 0, orgs: [] })
        }

        return res.status(200).send({status: 'ok', msg: 'success', count: orgs.length, orgs})
    } catch (e) {
        return res.status(500).send({status: 'error', msg:'Error occurred', error: e.message})
    }  
})


// Block organization account
router.post('/block', authToken, async (req, res) => {
    try {
        const { id, block_reason } = req.body
        if (!id || !block_reason ) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        const blocked = await Organization.findOneAndUpdate({ _id: id }, { is_blocked: true }, { new: true })
        if (!blocked) {
            return res.status(404).send({ status: 'error', msg: 'Organization not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', blocked })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Unblock organization account
router.post('/unblock', authToken, async (req, res) => {
    try {
        const { id } = req.body
        if (!id ) {
            return res.status(400).send({ status: 'error', msg: 'Organization ID is required' })
        }

        const unblocked = await Organization.findOneAndUpdate({ _id: id }, { is_blocked: false }, { new: true }
        )

        if (!unblocked) {
            return res.status(404).send({ status: 'error', msg: 'Organization not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', unblocked })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// View all blocked organizations
router.post('/blocked', authToken, async (req, res) => {
    try {
        // Fetch all blocked organization accounts
        const blocked = await Organization.find({ is_blocked: true })
            .select('-password').lean()

        if (blocked.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No blocked organizations found', blocked: [] })
        }

        res.status(200).send({ status: 'ok', msg: 'success', count: blocked.length, blocked })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Ban organization account
router.post('/ban', authToken, async (req, res) => {
    try {
        const { id, ban_reason } = req.body
        if (!id || !ban_reason) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        const banned = await Organization.findOneAndUpdate({ _id: id }, { is_banned: true }, { new: true })
        if (!banned) {
            return res.status(404).send({ status: 'error', msg: 'Organization not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', banned })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Unban a organization account
router.post('/unban', authToken, async (req, res) => {
    try {
        const { id } = req.body
        if (!id ) {
            return res.status(400).send({ status: 'error', msg: 'Organization ID is required' })
        }

        const unbanned = await Organization.findOneAndUpdate({ _id: id }, { is_banned: false }, { new: true }
        )

        if (!unbanned) {
            return res.status(404).send({ status: 'error', msg: 'Organization not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', unbanned })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// View all banned organizations
router.post('/banned', authToken, async (req, res) => {
    try {
        // Fetch all banned organization accounts
        const banned = await Organization.find({ is_banned: true })
            .select('-password').lean()

        if (banned.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No banned organizations found', banned: [] })
        }

        res.status(200).send({ status: 'ok', msg: 'success', count: banned.length, banned })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Delete organizations account
router.post('/delete', authToken, async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).send({ status: 'error', msg: 'Organization ID is required' })
        }

        const deleted = await Organization.findOneAndDelete({ _id: id })
        if (!deleted) {
            return res.status(404).send({ status: 'error', msg: 'Organization not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success' })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


module.exports = router