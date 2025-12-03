const express = require("express")
const router = express.Router()

const Scholarship = require("../../models/scholarship")
const SavedScholarship = require("../../models/saved_scholarship")
const authToken = require("../../middleware/authToken")
const { getDateFromPeriod } = require("../../functions/dateGetter")
const { isPremiumUser } = require("../../middleware/opportunityPost")
const { preventFreemiumDetailView } = require("../../middleware/freemiumlimit")



// ==========================
// 1. Browse all scholarships
// ==========================
router.post("/browse", authToken, async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ is_visible: true }).sort({ createdAt: -1 })
        res.status(200).send({ status: "ok", msg: 'success', scholarships })
    } catch (error) {
        res.status(500).send({ status: "error", message: "Server error", error: error.message })
    }
})


// ==========================
// 2. Search / Filter scholarships
// =======================
router.post("/search", authToken, async (req, res) => {
    try {
        const {
            keyword,        // search by name or university
            field_of_study,
            scholarship_type,
            region,
            date_posted,     // all, last_24_hours, last_3_days, last_7_days, last_14_days, last_30_days, over_1_month
            mode_of_study
        } = req.body

        const filter = {
            is_visible: true // only visible scholarships
        }
        
        // Keyword search on name or university
        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { university: { $regex: keyword, $options: "i" } }
            ]
        }

        // Filters
        if (field_of_study) filter.field_of_study = field_of_study
        if (scholarship_type) filter.scholarship_type = scholarship_type
        if (region) filter.region = region
        if (mode_of_study) filter.mode_of_study = mode_of_study

        // Date posted filter
        if (date_posted && date_posted !== "all") {
            const dateLimit = getDateFromPeriod(date_posted)
            if (dateLimit === "over_1_month") {
                // scholarships older than 30 days
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                filter.createdAt = { $lt: thirtyDaysAgo }
            } else if (dateLimit) {
                filter.createdAt = { $gte: dateLimit }
            }
        }

        const scholarships = await Scholarship.find(filter).sort({ createdAt: -1 })

        res.status(200).send({ status: "ok", msg: "success", scholarships })

    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 3. View single scholarship
// ==========================
router.post("/single",  authToken, preventFreemiumDetailView, async (req, res) => {
    try {
        const { scholarshipId } = req.body

        const scholarship = await Scholarship.findById(scholarshipId)
        if (!scholarship || !scholarship.is_visible) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        res.status(200).send({ status: "ok", msg: "success", scholarship })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 4. Save a scholarship
// ==========================
router.post("/save", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body
        const userId = req.user._id

        // Check if already saved
        const existing = await SavedScholarship.findOne({ userId, scholarshipId })
        if (existing) {
            return res.status(400).send({ status: "error", msg: "Scholarship already saved" })
        }

        const savedScholarship = new SavedScholarship({ userId, scholarshipId })
        await savedScholarship.save()

        res.status(200).send({ status: "ok", msg: "success", savedScholarship })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 5. Unsave a scholarship
// ==========================
router.post("/unsave", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body // the job to unsave
        const userId = req.user._id

        if (!scholarshipId) {
            return res.status(400).send({ status: 'error', msg: 'Scholarship ID is required' })
        }

        // Remove the scholarship from the user's saved scholarships array
        await SavedScholarship.findByIdAndDelete({ userId, scholarshipId })

        return res.status(200).send({ status: "ok", msg: "success" })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 6. List of saved scholarships
// ==========================
router.post("/saved", authToken, async (req, res) => {
    try {
        const userId = req.user._id
        const savedScholarships = await SavedScholarship.find({ userId }).populate("scholarshipId").sort({ createdAt: -1 })

        if (!savedScholarships.length) {
            return res.status(200).send({ status: 'ok', msg: 'You haven\'t saved any scholarship yet', count: 0 })
        }

        res.status(200).send({ status: "ok", msg: "success", count: savedScholarships.length, savedScholarships })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// PRE-STEP 1: INDIVIDUAL SELECT KIP
// ==========================
router.post("/select_kip", authToken, isPremiumUser, async (req, res) => {
    const { selected_kip } = req.body

    if ( !selected_kip ) {
        return res.status(400).send({ status: 'error', send: 'You must select a Kapacity Impact Partner'})
    }
    
    try {
        // Save a 'draft' training tied to the individual with selected KIP
        const newScholarship = new Scholarship({
            posted_by: req.user._id,
            posted_by_model: 'User',
            selected_kip,
            selected_kip_model: 'User', // or 'Organization' depending on KIP type
            kip_status: 'pending',
            step: 0 // indicates before Step 1
        })

        await newScholarship.save()
        res.status(201).send({ status: 'ok', msg: "success", newScholarship })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


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
            posted_by_model: 'User', // Or 'Organization' depending on who is posting
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
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'User' }, 
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
            posted_by_model: 'User' }, { new: true }
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
// GET ALL SCHOLARSHIP POSTED BY THIS USER
// =========================================
router.post('/all', authToken, isPremiumUser, async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ posted_by: req.user._id, posted_by_model: 'User' })
        .sort({ createdAt: -1 })

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
            posted_by_model: 'User'})
        
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
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'User' }
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
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'User' }, 
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
            { _id: scholarshipId, posted_by: req.user._id, posted_by_model: 'User' }
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