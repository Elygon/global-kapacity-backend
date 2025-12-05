const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken') // Assuming admin auth middleware
const BugReport = require('../../models/bug_report') // Your BugReport model


// endpoint for all bug reports (admin)
router.post('/all', authToken, async (req, res) => {
    try {
        const reports = await BugReport.find().sort({ createdAt: -1 })

        return res.status(200).json({ status: 'ok', msg: 'success', count: reports.length, bugReports: reports })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'error', msg: 'Server error', error: error.message })
    }
})


// View single bug report by ID
router.post('/view', authToken, async (req, res) => {
    try {
        const {id} = req.body
        if(!id) {
            return res.status(403).send({status: 'error', msg: 'Bug Report ID is required'})
        }
        const bugReport = await BugReport.findById(id)
        if (!bugReport) {
            return res.status(404).send({ status: 'error', msg: 'Bug report not found' });
        }
        return res.status(200).send({ status: 'ok', msg: 'success', bugReport })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', msg: 'Server error', error: error.message })
    }
})


// MARK a bug report as resolved
router.post('/mark', authToken, async (req, res) => {
    try {
        const { id } = req.body
        if(!id) {
            return res.status(403).send({ status:'error', msg: 'Bug Report ID is required'})
        }

        const updatedBug = await BugReport.findByIdAndUpdate( id, { resolved: true }, { new: true } )

        if (!updatedBug) {
            return res.status(404).send({ status: 'error', msg: 'Bug report not found' });
        }

        return res.status(200).send({ status: 'ok', msg: 'success', updatedBug })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: 'error', msg: 'Server error', error: error.message });
    }
})


// List of resolved reports
router.post("/resolved", authToken, async (req, res) => {
    try {
        const resolved = await BugReport.find({ resolved: true }).sort({ createdAt: -1 })
        if (!resolved.length) {
            return res.status(200).send({ status: 'ok', msg: 'No resolved reports yet', count: 0 })
        }

        res.status(200).send({ status: "ok", msg: "success", count: resolved.length, resolved })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// List of resolved reports
router.post("/unresolved", authToken, async (req, res) => {
    try {
        const unresolved = await BugReport.find({ resolved: false }).sort({ createdAt: -1 })
        if (!unresolved.length) {
            return res.status(200).send({ status: 'ok', msg: 'No unresolved reports', count: 0 })
        }

        res.status(200).send({ status: "ok", msg: "success", count: unresolved.length, unresolved })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


module.exports = router