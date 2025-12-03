const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Scholarship = require('../../models/scholarship')
const { isPremiumUser } = require("../../middleware/opportunityPost")


// ==========================
// STEP 1: POST A SCHOLARSHIP
// ==========================
router.post("/step_one", authToken, isPremiumUser, async (req, res) => {
    const { title, description, field_of_study, sponsoring_org_name, scholarship_type, mode_of_study,
        academic_level } = req.body

    if ( !title || !description || !field_of_study || !sponsoring_org_name || !scholarship_type || !mode_of_study 
        || !academic_level ) {
        return res.status(400).send({ status: 'error', send: 'All fields are required'})
    }
    
    try {
        const newScholar = new Scholarship({
            posted_by: req.user._id, // This references the user/org creating the schoarship
            posted_by_model: 'Organization', // Or 'User' depending on who is posting
            title,
            description,
            field_of_study,
            sponsoring_org_name,
            scholarship_type,
            mode_of_study,
            academic_level,
            step: 1
        })

        await newScholar.save()
        res.status(201).send({ status: 'ok', msg: "success", newScholar })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// STEP 2: POST A SCHOLARSHIP
// ==========================
router.post("/step_two", authToken, isPremiumUser, async (req, res) => {
    const { scholarshipId, eligibility_criteria, requirements, benefits, no_of_slots, region, scholarship_value } = req.body
    if (!scholarshipId || !eligibility_criteria || !requirements || !benefits || !no_of_slots || !region 
        || !scholarship_value
    ) {
        return res.status(404).send({ status: 'error', msg: "All fields are required" })
    }

    // Convert slots to number
    const slots = Number(no_of_slots)

    // Validate slots
    if (isNaN(slots) || slots < 1) {
        return res.status(400).send({ status: 'error', msg: "Number of slots must be a valid number greater than 0" })
    }
    
    try {
        const scholarship = await Scholarship.findById(scholarshipId)

        if (!scholarship) {
            return res.status(404).send({ status: 'error', msg: "Scholarship not found." })
        }

        // Update step 2 details
        scholarship.eligibility_criteria = eligibility_criteria
        scholarship.requirements = requirements
        scholarship.benefits = benefits
        scholarship.no_of_slots = no_of_slots
        scholarship.region = region
        scholarship.scholarship_value = Array.isArray(scholarship_value) ? scholarship_value : [scholarship_value]
        scholarship.step = 2

        await scholarship.save()
        res.status(200).send({ status: 'ok', msg: "success", scholarship })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// STEP 3: POST A SCHOLARSHIP
// ==========================
router.post("/step_three", authToken, isPremiumUser, async (req, res) => {
    const { scholarshipId, open_date, deadline, shortlist_date, interview_date, winners_announcement_date,
        disbursement_date, application_link} = req.body
    if (!scholarshipId || !open_date || !deadline || !application_link) {
        return res.status(404).send({ status: 'error', msg: "All fields are required" })
    }
    
    try {
        // Build step 3 object
        const step3Data = {
            open_date: open_date,
            deadline: deadline,
            shortlist_date: shortlist_date, // optional
            interview_date: interview_date, // optional
            winners_announcement_date: winners_announcement_date, //optional
            disbursement_date: disbursement_date, // optional
            application_link: application_link
        }
        const updated = await Scholarship.findByIdAndUpdate(
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'Organization' }, 
            { $set: { ...step3Data, step: 3, updatedAt: Date.now() }}, { new: true })

        if (!updated) {
            return res.status(404).send({ status: 'error', msg: "Scholarship not found." })
        }

        res.status(200).send({ status: 'ok', msg: "success", updated })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// =========================================
// PUBLISH SCHOLARSHIP
// =========================================
router.post('/publish', authToken, isPremiumUser, async (req, res) => {
    const { scholarshipId } = req.body
    
    try {
        const scholarship = await Scholarship.findOneAndUpdate({ _id: scholarshipId, posted_by: req.user._id,
            posted_by_model: 'Organization'  }, { $set: { is_published: true , updatedAt: Date.now() }}, { new: true }
        )

        if (!scholarship)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found' })

        if (scholarship.step !== 3)
            return res.status(400).send({ send: 'error', msg: 'Complete all steps before publishing'})

        scholarship.admin_status = 'submitted'
        scholarship.updatedAt = Date.now()

        await scholarship.save()

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship })
    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})


// =========================================
// GET ALL SCHOLARSHIP POSTED BY THIS ORGANIZATION
// =========================================
router.post('/all', authToken, isPremiumUser, async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ posted_by: req.user._id, posted_by_model: 'Organization' })
        .sort({ date_posted: -1 })

        if (!scholarships.length)
            return res.status(200).send({ status: 'ok', msg: 'No scholarship postings found' })

        return res.status(200).send({ status: 'ok', msg: 'success', count: scholarships.length, scholarships })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// VIEW A SPECIFIC SCHOLARSHIP
// =========================================
router.post('/view', authToken, isPremiumUser, async (req, res) => {
    const { scholarshipId } = req.body

    if (!scholarshipId)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const scholarship = await Scholarship.findOne({ _id: scholarshipId, posted_by: req.user._id,
            posted_by_model: 'Organization'})
        
        if (!scholarship)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// UPDATE A SCHOLARSHIP INFO
// =========================================
router.post('/update', authToken, isPremiumUser, async (req, res) => {
    const { scholarshipId, ...updateData } = req.body
    
    if (!scholarshipId)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const scholarship = await Scholarship.findOne(
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'Organization' }
        )

        if (!scholarship)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found' })

        updateData.timestamp = Date.now()

        const updated = await Scholarship.findByIdAndUpdate(scholarshipId, updateData, { new: true })

        return res.status(200).send({ status: 'ok', msg: 'success', updated })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// CLOSE A SCHOLARSHIP POSTING
// =========================================
router.post('/close', authToken, isPremiumUser, async (req, res) => {
    const { scholarshipId } = req.body

    if (!scholarshipId)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const scholarship = await Scholarship.findOneAndUpdate(
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'Organization' }, 
            { $set: { is_closed: true }}, { new: true })

        if (!scholarship)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', scholarship })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// DELETE SCHOLARSHIP POSTING
// =========================================
router.post('/delete', authToken, isPremiumUser, async (req, res) => {
    const { scholarshipId } = req.body

    if (!scholarshipId)
        return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })

    try {
        const deleted = await Scholarship.findOneAndDelete(
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'Organization' }
        )

        if (!deleted)
            return res.status(404).send({ status: 'error', msg: 'Scholarship not found or already deleted' })

        

        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})


module.exports = router