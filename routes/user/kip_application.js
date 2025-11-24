const express = require("express")
const router = express.Router()

const authToken = require("../../middleware/authToken")
const KIPApplication = require("../../models/kip_application")
const { preventFreemiumKIP } = require("../../middleware/freemiumlimit")



// ==========================
// STEP 1: SUBMIT KIP APPLICATION 
// ==========================
router.post("/step_one", authToken, preventFreemiumKIP, async (req, res) => {
    const { organization_name, organization_type, reg_no, aof, // AOF (Area of Focus)
        email, phone_no, website, countries, location, social_links
    } = req.body

    if ( !organization_name || !organization_type || !reg_no || !aof || !email || !phone_no || !website || !countries
        || !location || !social_links
    ) {
        return res.status(400).send({ status: 'error', send: 'All fields are required'})
    }
    
    try {
        const newApplication = new KIPApplication({
            userId: req.user._id,
            organization_name,
            organization_type,
            reg_no,
            aof, // AOF (Area of Focus)
            email,
            phone_no,
            website,
            countries,
            location,
            social_links,
            step: 1
        })

        await newApplication.save()
        res.status(201).send({ status: 'ok', msg: "success", newApplication })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// STEP 2: SUBMIT KIP APPLICATION
// ==========================
router.post("/step_two", authToken, preventFreemiumKIP, async (req, res) => {
    const { applicationId, contact_name, role, document, description } = req.body
    if (!applicationId || !contact_name || !role || !document || !description ) {
        return res.status(404).send({ status: 'error', msg: "All fields are required" })
    }
    
    try {
        const application = await KIPApplication.findById(applicationId)

        if (!application) {
            return res.status(404).send({ status: 'error', msg: "Application not found." })
        }

        // Update step 2 details
        application.contact_name = contact_name
        application.role = role
        application.document = document
        application.description = description
        application.step = 2
        application.status = 'Pending'

        await application.save()
        res.status(200).send({ status: 'ok', msg: "success", application })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// VIEW APPLICATION STATUS
// ==========================
router.post("/my_application", authToken, async (req, res) => {
    try {
        const application = await KIPApplication.findOne({ user_id: req.user._id })
        if (!application) {
            return res.status(404).send({ status: 'error', msg: "Application not found" })
        }

        res.status(200).send({ status: 'ok', msg: "success", application })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// CANCEL APPLICATION
// ==========================
router.post("/cancel", authToken, async (req, res) => {
    const { applicationId, userId } = req.body
    if (!applicationId || !userId) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required'})
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).send({ status: 'error', msg: 'Invalid Application ID'})
    }

    try {
        const application = await KIPApplication.findOne({ _id: applicationId, user_id: req.user._id })
        if (!application) {
            return res.status(404).send({ status: 'error', msg: "Application not found" })
        }

        // Optional: Only allow cancel if status is not already approved/rejected
        if (application.status === 'Approved' || application.status === 'Rejected') {
            return res.status(400).send({ status: 'error', msg: 'Already been reviewed'})
        }

        await KIPApplication.deleteOne({ _id: applicationId })

        res.status(200).send({ status: 'ok', msg: "success", application })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


module.exports = router