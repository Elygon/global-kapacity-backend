const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const KIP = require('../../models/kip')



// View all approved KIP members
router.post('/all', authToken, async (req, res) => {
    try {
        const members = await KIP.find().toSorted({ createdAt: -1 })
        res.status(200).send({ status: 'ok', msg: 'success', members })
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message})
    }
})


// View specific KIP member by ID
router.post('/view', authToken, async(req, res) => {
    const { kipId } = req.body
    if (!kipId) {
        return res.status(400).send({ status: 'error', msg: 'Partner ID is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(kipId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid KIP ID'})
    }

    try {
        const member = await KIP.findById(kipId)
        if (!member) {
            return res.status(404).send({ status: 'error', msg: 'KIP member not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', member })
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message})
    }
})

/*
// Update KIP member permissions
router.post('/update', authToken, async(req, res) => {
    const { kipId, canPostJobs, canPostScholarships, canPostTrainings } = req.body
    if (!kipId) {
        return res.status(400).send({ status: 'error', msg: 'KIP ID is required'})
    }

    try {
        const kip = await KIP.findByIdAndUpdate(kipId, {
            'permissions.canPostJobs': canPostJobs,
            'permissions.canPostScholarships': canPostScholarships,
            'permissions.canPostTrainings': canPostTrainings,
        }, { new: true })

        if (!kip) {
            return res.status(404).send({ status: 'error', msg: 'KIP member not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', partner: kip })
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})*/


// Suspend or restore KIP member
router.post('/toggle_status', authToken, async(req, res) => {
    const { kipId, status } = req.body
    if (!kipId || !status) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required'})
    }

    try {
        if (!['Active', 'Suspended'].includes(status)) {
            return res.status(400).send({ status: 'error', msg: 'Invalid status value' })
        }
        const kip = await KIP.findByIdAndUpdate(kipId, { status }, { new: true})

        if (!kip) {
            return res.status(404).send({ status: 'error', msg: 'KIP member not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', kip})
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})


// Delete KIP member entirely
router.post('/delete', authToken, async(req, res) => {
    const {kipId} = req.body
    if(!kipId) {
        return res.status(400).send({ status: 'error', msg: 'KIP ID is required' })
    }

    try {
        const kip = await KIP.findByIdAndDelete(kipId)

        if (!kip) {
            return res.status(404).send({ status: 'error', msg: 'KIP member not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', kip })
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})

module.exports = router