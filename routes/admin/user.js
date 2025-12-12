const express = require("express")
const router = express.Router()

const dotenv = require("dotenv");
dotenv.config()

const User = require('../../models/user')
const UserProfile = require('../../models/user_profile')
const authToken = require('../../middleware/authToken')



// View all users 
router.post("/all", authToken, async (req, res) => {
    try {
        const users = await User.find().sort({ timestamp: -1 })
        if (users.length === 0) return res.status(200).send({ status: "ok", msg: "No users found" })

        return res.status(200).send({ status: "ok", msg: 'success', count: users.length, users })

    } catch (e) {
        if (e.name === "JsonWebTokenError") {
            return res.status(400).send({ status: "error", msg: "Token verification failed", error: e.message })
        }
        return res.status(500).send({ status: "error", msg: "Error occurred", error: e.message })
    }
})


// View single user 
router.post('/view', authToken, async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).send({ status: 'error', msg: 'User ID is required' })
    }

    try {
        const user = await User.findById(id)
        if (!user) return res.status(404).send({ status: 'error', msg: 'User not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', user })
    } catch (e) {
        if (e.name === 'JsonWebTokenError') {
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })
        }
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Search for users
router.post("/search", authToken, async (req, res) => {
    const { name } = req.body

    if (!name) {
        return res.status(400).send({ status: 'error', msg: 'Name is required' })
    }

    try {
        // Find the users
        const users = await User.find({
            name: { $regex: name, $options: "i" }
        }).sort({ date_added: -1 })

        if (!users || users.length === 0) {
            return res.status(200).send({ status: 'ok', msg: "No users found", count: 0, users: [] })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', count: users.length, users })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Block user account
router.post('/block', authToken, async (req, res) => {
    try {
        const { id, block_reason } = req.body
        if (!id || !block_reason) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        const blocked = await User.findOneAndUpdate({ _id: id }, { is_blocked: true }, { new: true })
        if (!blocked) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', blocked })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Unblock user account
router.post('/unblock', authToken, async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).send({ status: 'error', msg: 'User ID is required' })
        }

        const unblocked = await User.findOneAndUpdate({ _id: id }, { is_blocked: false }, { new: true }
        )

        if (!unblocked) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', unblocked })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// View all blocked users
router.post('/blocked', authToken, async (req, res) => {
    try {
        // Fetch all blocked user accounts
        const blocked = await User.find({ is_blocked: true })
            .select('-password').lean()

        if (blocked.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No blocked users found', blocked: [] })
        }

        res.status(200).send({ status: 'ok', msg: 'success', count: blocked.length, blocked })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Ban user account
router.post('/ban', authToken, async (req, res) => {
    try {
        const { id, ban_reason } = req.body
        if (!id || !ban_reason) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        const banned = await User.findOneAndUpdate({ _id: id }, { is_banned: true }, { new: true })
        if (!banned) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', banned })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Unban a user account
router.post('/unban', authToken, async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).send({ status: 'error', msg: 'User ID is required' })
        }

        const unbanned = await User.findOneAndUpdate({ _id: id }, { is_banned: false }, { new: true }
        )

        if (!unbanned) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', unbanned })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// View all banned users
router.post('/banned', authToken, async (req, res) => {
    try {
        // Fetch all banned user accounts
        const banned = await User.find({ is_banned: true })
            .select('-password').lean()

        if (banned.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No banned users found', banned: [] })
        }

        res.status(200).send({ status: 'ok', msg: 'success', count: banned.length, banned })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Delete users account
router.post('/delete', authToken, async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).send({ status: 'error', msg: 'User ID is required' })
        }

        const deleted = await User.findOneAndDelete({ _id: id })
        if (!deleted) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success' })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})

// Approve profile verification
router.post('/approve', authToken, async (req, res) => {
    try {
        const { user_id } = req.body

        if (!user_id) {
            return res.status(400).send({ status: 'error', msg: 'User ID is required' })
        }

        // Find user profile
        const profile = await UserProfile.findOne({ user_id })

        if (!profile) {
            return res.status(404).send({ status: 'error', msg: 'User profile not found' })
        }

        if (!profile.verification || !profile.verification.status) {
            return res.status(400).send({ status: 'error', msg: 'No verification request found' })
        }

        if (profile.verification.status === 'approved') {
            return res.status(400).send({ status: 'error', msg: 'Profile already verified' })
        }

        // Update verification status
        profile.verification.status = 'approved'
        profile.verification.reviewed_at = new Date()
        profile.verification.reviewed_by = req.user._id

        await profile.save()

        res.status(200).send({ status: 'ok', msg: 'success', verification: profile.verification })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})

// Reject profile verification
router.post('/reject', authToken, async (req, res) => {
    try {
        const { user_id, rejection_reason } = req.body

        if (!user_id || !rejection_reason) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        // Find user profile
        const profile = await UserProfile.findOne({ user_id })

        if (!profile) {
            return res.status(404).send({ status: 'error', msg: 'User profile not found' })
        }

        if (!profile.verification || !profile.verification.status) {
            return res.status(400).send({ status: 'error', msg: 'No verification request found' })
        }

        // Update verification status
        profile.verification.status = 'rejected'
        profile.verification.rejection_reason = rejection_reason
        profile.verification.reviewed_at = new Date()
        profile.verification.reviewed_by = req.user._id

        await profile.save()

        res.status(200).send({ status: 'ok', msg: 'success', verification: profile.verification })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})


module.exports = router