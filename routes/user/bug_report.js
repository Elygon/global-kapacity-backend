const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
dotenv.config()

const authToken = require('../../middleware/authToken') // your auth middleware
const BugReport = require('../../models/bug_report')

// endpoint to report a bug / give feedback
router.post('/report', authToken, async (req, res) => {
    const { email, phone, message } = req.body

    if (!email || !phone || !message) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required' });
    }

    try {
        const report = new BugReport({
            user_id: req.user._id,
            email,
            phone_no: phone,
            message
        });
        await report.save()

        return res.status(200).send({ status: 'ok', msg: 'success', report });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: error.message })
    }
})


/*
// View all bug reports (optional)
router.post('/all', authToken, async (req, res) => {
    try {
        const reports = await BugReport.find().sort({ createdAt: -1 })

        if (!reports.length) {
            return res.status(200).send({ status: 'ok', msg: 'No bug reports found' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', count: reports.length, reports })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: error.message })
    }
})


// View a single bug report (optional)
router.post('/view', authToken, async (req, res) => {
    const { id } = req.body
    if (!id)
        return res.status(400).send({ status: 'error', msg: 'Bug Report ID is required.' })
    try {
        const report = await BugReport.findById(id)

        if (!report)
            return res.status(400).send({ status: 'error', msg: 'Bug Report not found.' })

        return res.status(200).send({ status: 'ok', msg: 'success', report })
    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid or expired token.' })
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Delete a bug report (optional)
router.post('/delete', authToken, async (req, res) => {
    const { id } = req.body

    if ( !id ) {
        return res.status(400).send({ status:'error', msg: 'Bug Report ID is required'})
    }

    try {
        const deleted = await BugReport.findByIdAndDelete(id)
        if (!deleted) return res.status(404).send({ status: 'error', msg: 'Report not found' })

        return res.status(200).send({ status: 'ok', msg: 'Report deleted successfully' })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: error.message })
    }
})*/

module.exports = router