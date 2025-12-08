const express = require('express')
const router = express.Router()

const User = require('../../models/user')
const Organization = require('../../models/organization')

// Temporary Dev endpoint for User Subscription Upgrade
router.post('/user_premium', async (req, res) => {
    const { userId, devKey } = req.body

    // Simple security (dev use only)
    if (devKey !== process.env.DEV_SECRET_KEY) {
        return res.status(403).send({ status: 'error', msg: 'Invalid developer key' })
    }

    if (!userId) {
        return res.status(400).send({ status: 'error', msg: 'UserId is required' })
    }

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        user.is_premium_user = true
        user.sub_plan = 'yearly'
        user.expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        user.subscription = {
            status: 'active',
            plan: 'premium',
            start_date: new Date(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }

        await user.save()

        return res.send({ status: 'success', msg: 'User upgraded to premium', user })
    } catch (e) {
        console.error(e)
        return res.status(500).send({ status: 'error', msg: 'Internal server error', error: e.message })
    }
})


// Temporary Dev endpoint for Organization Subscription Upgrade
router.post('/org_premium', async (req, res) => {
    const { orgId, devKey } = req.body

    // Simple security (dev use only)
    if (devKey !== process.env.DEV_SECRET_KEY) {
        return res.status(403).send({ status: 'error', msg: 'Invalid developer key' })
    }

    if (!orgId) {
        return res.status(400).send({ status: 'error', msg: 'Organization Id is required' })
    }

    try {
        const org = await Organization.findById(orgId)
        if (!org) {
            return res.status(404).send({ status: 'error', msg: 'Organization not found' })
        }

        org.is_premium_org = true
        org.sub_plan = 'yearly'
        org.expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        org.subscription = {
            status: 'active',
            plan: 'premium',
            start_date: new Date(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }

        await org.save()

        return res.send({ status: 'success', msg: 'Organization upgraded to premium', org })
    } catch (e) {
        console.error(e)
        return res.status(500).send({ status: 'error', msg: 'Internal server error', error: e.message })
    }
})


module.exports = router