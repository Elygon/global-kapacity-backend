const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const KIPApplication = require('../../models/kip_application')
const KIP = require('../../models/kip')
const { sendKipApprovalMail, sendKipRejectionMail } = require('../../utils/nodemailer')



// GET all KIP applications (whether pending, approved or rejected)
router.post('/all', authToken, async(req, res) => {
    try {
        const apps = await KIPApplication.find().populate('organization_id', 'name email').Sort({ createdAt: -1 })

        res.status(200).send({ status: 'ok', msg: 'success', apps})
    } catch (err) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})


// GET a specific KIP application by ID
router.post('/view', authToken, async(req, res) => {
    const {appId} = req.body
    
    if (!mongoose.Types.ObjectId.isValid(appId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid ApplIcation ID' })
    }

    try {
        const app = await KIPApplication.findById(appId).populate('organization_id', 'company_name email')

        if (!app) return res.status(404).send({ status: 'error', msg: 'Application not found' })

        res.status(200).send({ status: 'ok', status: 'success', app})
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
    }
})


// APPROVE KIP APPLICATION
router.post('/approve', authToken, async(req, res) => {
    const {appId} = req.body

    if (!mongoose.Types.ObjectId.isValid(appId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid ApplIcation ID' })
    }

    try {
        const app = await KIPApplication.findById(appId)
        if (!app) return res.status(404).send({ status: 'error', msg: 'Application not found'})

        // Update application status
        app.status = 'Approved'
        app.reviewed_at = new Date()
        app.reviewed_by = adminId // if you track admin ID

        await app.save()

        // Add to KIP members list
        const newKIP = await KIP.create({
            organization_id: app.organization_id,  
            name: app.organization_name,
            type: app.organization_type,
            aof: app.aof,
            email: app.email,
            phone_no: app.phone_no,
            website: app.website,
            countries: app.countries,
            location: app.location,
            social_links: app.social_links,
            /*isPartner: true,
            canPostJobs: true,
            canPostTrainings: true,
            canPostScholarships: true*/
        })
        await newKIP.save()

        // Send KIP Approval Email
        await sendKipApprovalMail(email, organization_name)


        res.status(200).send({ status: 'ok', msg: 'success', newKIP})
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error', error: err.message})
    }
})


// REJECT APPLICATION
router.post('/reject', authToken, async(req, res) => {
    const {appId, reason} = req.body

    if (!mongoose.Types.ObjectId.isValid(appId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid ApplIcation ID' })
    }

    try {
        const app = await KIPApplication.findById(appId)
        if (!app) return res.status(404).send({ status: 'error', msg: 'Application not found'})

        // Update application status
        app.status = 'Rejected'
        app.rejection_reason = reason || ''
        await app.save()

        // Send KIP Rejection Email
        await sendKipRejectionMail(email, organization_name, reason)


        res.status(200).send({ status: 'ok', msg: 'success', app })
    } catch (err) {
        res.status(500).send({ status: 'error', msg: 'Error', error: err.message})
    }
})


module.exports = router