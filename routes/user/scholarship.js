const express = require("express")
const router = express.Router()

const Scholarship = require("../../models/scholarships")
const SavedScholarship = require("../../models/saved_scholarship")
const authToken = require("../../middleware/authToken")
const { getDateFromPeriod } = require("../../functions/dateGetter")



// ==========================
// 1. Browse all scholarships
// ==========================
router.post("/browse", /*authToken,*/ async (req, res) => {
    try {
        const scholarships = await Scholarship.find().sort({ createdAt: -1 })
        res.status(200).send({ status: "ok", msg: "success", scholarships })
    } catch (error) {
        res.status(500).send({ status: "error", message: "Server error", error: error.message })
    }
})


// ==========================
// 2. Search / Filter scholarships
// =======================
router.post("/search", /* authToken, */ async (req, res) => {
    try {
        const {
            keyword,        // search by name or university
            field_of_study,
            scholarship_type,
            region,
            gender_based,
            date_posted,     // all, last_24_hours, last_3_days, last_7_days, last_14_days, last_30_days, over_1_month
            mode_of_study
        } = req.body

        const filter = {}

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
        if (gender_based) filter.gender_based = gender_based
        if (mode_of_study) filter.mode_of_study = mode_of_study

        // Date posted filter
        if (date_posted && date_posted !== "all") {
            const dateLimit = getDateFromPeriod(date_posted)
            if (dateLimit === "over_1_month") {
                // scholarships older than 30 days
                const thirtyDaysAgo = new Date();
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
router.post("/view",  /*authToken,*/ async (req, res) => {
    try {
        const { scholarshipId } = req.body

        const scholarship = await Scholarship.findById(scholarshipId)
        if (!scholarship) return res.status(404).send({ status: "error", msg: "Scholarship not found" })

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
        const updatedUser = await User.findByIdAndUpdate( userId, 
            { $pull: { savedScholarships: scholarshipId }}, // assumes saved scholarships is an array of ObjectIds
            { new: true }
        )

        return res.status(200).send({ status: "ok", msg: "success", savedScholarships: updatedUser.savedScholarships })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 6. List saved scholarships
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


module.exports = router