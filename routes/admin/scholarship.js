const express = require('express')
const router = express.Router()

const Scholarship = require('../../models/scholarship')
const User = require('../../models/user')
const Organization = require('../../models/organization')
const authToken = require('../../middleware/authToken')
const { scholarshipApprovalMail, scholarshipRejectionMail, scholarshipHiddenMail,
    scholarshipToKipMail, scholarshipNotifyKipMail  } = require('../../utils/nodemailer')



// ======================================================================
// 1. GET ALL SCHOLARSHIPS (VISIBLE + NON-VISIBLE)
// ======================================================================
router.post("/all", authToken, async (req, res) => {
    try {
        const scholarships = await Scholarship.find()
        .populate("posted_by", "firstname lastname company_name email")
        .sort({ createdAt: -1 });

        return res.status(200).send({ status: 'ok', msg: 'success', scholarships })
    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})


// ======================================================================
// 2. GET SCHOLARSHIPS WAITING FOR ADMIN REVIEW
// ======================================================================
router.post('/pending', authToken, async (req, res) => {
    try {
        const scholarships = await Scholarship.find({ admin_status: "pending admin review" })

        return res.status(200).send({ status: "ok", msg: 'success', scholarships })
    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server Error', error: error.message })
    }
})


// ======================================================================
// 3. GET A SPECIFIC SCHOLARSHIP
// ======================================================================
router.post("/specific", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body

        if (!scholarshipId) {
            return res.status(400).send({ status: "error", msg: "Scholarship ID is required" })
        }

        const scholarship = await Scholarship.findById(scholarshipId)
            .populate("posted_by", "firstname lastname company_name email")
            .populate("selected_kip", "firstname lastname company_name email")

        if (!scholarship) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        return res.status(200).send({ status: "ok", msg: 'success', scholarship })
    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 4. ADMIN APPROVES SCHOLARSHIP
// Individual user → admin approved (NOT visible yet, must send to KIP)
// Organization → admin approved AND immediately published
// ======================================================================
router.post("/approve", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body;

        const scholarship = await Scholarship.findById(scholarshipId).populate("posted_by")

        if (!scholarship) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        // ADMIN APPROVES
        scholarship.admin_status = "admin approved"

        // If posted by ORGANIZATION → publish immediately
        if (scholarship.posted_by_model === "Organization") {
            scholarship.admin_status = "published"
            await scholarship.save()

            // Send approval mail
            await scholarshipApprovalMail(
                scholarship.posted_by.email,
                scholarship.posted_by.company_name || scholarship.posted_by.firstname,
                scholarship.title
            )

            return res.status(200).send({ status: "ok", msg: "Scholarship approved and published", scholarship })
        }

        // If posted by USER → must go to KIP next
        await scholarship.save()

        await scholarshipApprovalMail( scholarship.posted_by.email, scholarship.posted_by.firstname, scholarship.title )

        return res.status(200).send({ status: "ok",
            msg: "Scholarship approved, waiting for Impact Partner response",
            scholarship
        })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 5. ADMIN REJECTS SCHOLARSHIP
// ======================================================================
router.post("/reject", authToken, async (req, res) => {
    try {
        const { scholarshipId, reason } = req.body

        const scholarship = await Scholarship.findById(scholarshipId).populate("posted_by")

        if (!scholarship) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        scholarship.admin_status = "admin rejected"
        scholarship.admin_rejection_reason = reason || "No reason provided"

        await scholarship.save()

        await scholarshipRejectionMail(
            scholarship.posted_by.email,
            scholarship.posted_by.company_name || scholarship.posted_by.firstname,
            scholarship.title,
            reason
        )

        return res.status(200).send({ status: "ok", msg: 'success', scholarship })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 6. ADMIN SENDS APPROVED USER-SCHOLARSHIP TO SELECTED KIP
// ======================================================================
router.patch("/send_to_kip", authToken, async (req, res) => {
    try {
        const { scholarshipId, kipId, kipModel } = req.body

        if (!scholarshipId || !kipId || !kipModel) {
            return res.status(400).send({ status: "error", msg: "All fields are required" })
        }

        const scholarship = await Scholarship.findById(scholarshipId)
        .populate('posted_by', 'firstname lastname company_name email').populate('selected_kip')

        if (!scholarship) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        // ensure only individual-user posted scholarships use kip flow
        if (scholarship.posted_by_model !== "User") {
            return res.status(400).send({ 
                status: "error", 
                msg: "Only user-posted scholarships require Impact Partner Assignment" 
            })
        }

        if (scholarship.admin_status !== "admin approved") {
            return res.status(400).send({
                status: "error",
                msg: "Admin must approve before sending to Impact Partner"
            })
        }

        scholarship.selected_kip = kipId
        scholarship.selected_kip_model = kipModel
        scholarship.admin_status = "sent to kip"
        scholarship.kip_status = "pending"

        await scholarship.save()

        // send emails
        await scholarshipToKipMail(scholarship.posted_by.email, scholarship.posted_by.firstname, scholarship.title)
        await scholarshipNotifyKipMail(scholarship.selected_kip.email, scholarship.selected_kip.organization_name,
            scholarship.title)

        return res.status(200).send({ status: "ok", msg: 'success', scholarship })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 7. ADMIN HIDES SCHOLARSHIP (AFTER PUBLISH)
// ======================================================================
router.post("/hide", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body

        const scholarship = await Scholarship.findById(scholarshipId).populate("posted_by")

        if (!scholarship) {
            return res.status(404).send({ status: "error", msg: "Scholarship not found" })
        }

        scholarship.admin_status = "pending admin review"

        await scholarship.save()

        await scholarshipHiddenMail(
            scholarship.posted_by.email,
            scholarship.posted_by.company_name || scholarship.posted_by.firstname,
            scholarship.title
        )

        return res.status(200).send({ status: "ok", training: scholarship })

    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message })
    }
})



// ======================================================================
// 8. DELETE SCHOLARSHIP (Fraud / Violation)
// ======================================================================
router.post("/delete", authToken, async (req, res) => {
    try {
        const { scholarshipId } = req.body

        const deleted = await Scholarship.findByIdAndDelete(scholarshipId)

        return res.status(200).send({ status: "ok", msg: 'success', deleted })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})

module.exports = router