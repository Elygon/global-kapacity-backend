const express = require('express')
const router = express.Router()

const Training = require('../../models/training')
const User = require('../../models/user')
const Organization = require('../../models/organization')
const authToken = require('../../middleware/authToken')
const { trainingApprovalMail, trainingRejectionMail, trainingHiddenMail,
    trainingToKipMail, trainingNotifyKipMail  } = require('../../utils/nodemailer')



// ======================================================================
// 1. GET ALL TRAININGS (VISIBLE + NON-VISIBLE)
// ======================================================================
router.post("/all", authToken, async (req, res) => {
    try {
        const trainings = await Training.find()
        .populate("posted_by", "firstname lastname company_name email")
        .sort({ createdAt: -1 });

        return res.status(200).send({ status: 'ok', msg: 'success', trainings })
    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})


// ======================================================================
// 2. GET TRAININGS WAITING FOR ADMIN REVIEW
// ======================================================================
router.post('/pending', authToken, async (req, res) => {
    try {
        const trainings = await Training.find({ admin_status: "pending admin review" })

        return res.status(200).send({ status: "ok", msg: 'success', trainings })
    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server Error', error: error.message })
    }
})


// ======================================================================
// 3. GET A SPECIFIC TRAINING
// ======================================================================
router.post("/specific", authToken, async (req, res) => {
    try {
        const { trainingId } = req.body

        if (!trainingId) {
            return res.status(400).send({ status: "error", msg: "Training ID is required" })
        }

        const training = await Training.findById(trainingId)
            .populate("posted_by", "firstname lastname company_name email")
            .populate("selected_kip", "firstname lastname company_name email")

        if (!training) {
            return res.status(404).send({ status: "error", msg: "Training not found" })
        }

        return res.status(200).send({ status: "ok", msg: 'success', training })
    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 4. ADMIN APPROVES TRAINING
// Individual user → admin approved (NOT visible yet, must send to KIP)
// Organization → admin approved AND immediately published
// ======================================================================
router.post("/approve", authToken, async (req, res) => {
    try {
        const { trainingId } = req.body;

        const training = await Training.findById(trainingId).populate("posted_by")

        if (!training) {
            return res.status(404).send({ status: "error", msg: "Training not found" })
        }

        // ADMIN APPROVES
        training.admin_status = "admin approved"

        // If posted by ORGANIZATION → publish immediately
        if (training.posted_by_model === "Organization") {
            training.admin_status = "published"
            await training.save()

            // Send approval mail
            await trainingApprovalMail(
                training.posted_by.email,
                training.posted_by.company_name || training.posted_by.firstname,
                training.title
            )

            return res.status(200).send({ status: "ok", msg: "Training approved and published", training })
        }

        // If posted by USER → must go to KIP next
        await training.save()

        await trainingApprovalMail( training.posted_by.email, training.posted_by.firstname, training.title )

        return res.status(200).send({ status: "ok",
            msg: "Training approved, waiting for Impact Partner response",
            training
        })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 5. ADMIN REJECTS TRAINING
// ======================================================================
router.post("/reject", authToken, async (req, res) => {
    try {
        const { trainingId, reason } = req.body

        const training = await Training.findById(trainingId).populate("posted_by")

        if (!training) {
            return res.status(404).send({ status: "error", msg: "Training not found" })
        }

        training.admin_status = "admin rejected"
        training.admin_rejection_reason = reason || "No reason provided"

        await training.save()

        await trainingRejectionMail(
            training.posted_by.email,
            training.posted_by.company_name || training.posted_by.firstname,
            training.title,
            reason
        )

        return res.status(200).send({ status: "ok", msg: 'success', training })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 6. ADMIN SENDS APPROVED USER-TRAINING TO SELECTED KIP
// ======================================================================
router.patch("/send_to_kip", authToken, async (req, res) => {
    try {
        const { trainingId, kipId, kipModel } = req.body

        if (!trainingId || !kipId || !kipModel) {
            return res.status(400).send({ status: "error", msg: "All fields are required" })
        }

        const training = await Training.findById(trainingId)
        .populate('posted_by', 'firstname lastname company_name email').populate('selected_kip')

        if (!training) {
            return res.status(404).send({ status: "error", msg: "Training not found" })
        }

        // ensure only individual-user posted trainings use kip flow
        if (training.posted_by_model !== "User") {
            return res.status(400).send({ 
                status: "error", 
                msg: "Only user-posted trainings require Impact Partner Assignment" 
            })
        }

        if (training.admin_status !== "admin approved") {
            return res.status(400).send({
                status: "error",
                msg: "Admin must approve before sending to Impact Partner"
            })
        }

        training.selected_kip = kipId
        training.selected_kip_model = kipModel
        training.admin_status = "sent to kip"
        training.kip_status = "pending"

        await training.save()

        // send emails
        await trainingToKipMail(training.posted_by.email, training.posted_by.firstname, training.title)
        await trainingNotifyKipMail(training.selected_kip.email, training.selected_kip.organization_name, training.title)

        return res.status(200).send({ status: "ok", msg: 'success', training })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})



// ======================================================================
// 7. ADMIN HIDES TRAINING (AFTER PUBLISH)
// ======================================================================
router.post("/hide", authToken, async (req, res) => {
    try {
        const { trainingId } = req.body

        const training = await Training.findById(trainingId).populate("posted_by")

        if (!training) {
            return res.status(404).send({ status: "error", msg: "Training not found" })
        }

        training.admin_status = "pending admin review"

        await training.save()

        await trainingHiddenMail(
            training.posted_by.email,
            training.posted_by.company_name || training.posted_by.firstname,
            training.title
        )

        return res.status(200).send({ status: "ok", training })

    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message })
    }
})



// ======================================================================
// 8. DELETE TRAINING (Fraud / Violation)
// ======================================================================
router.post("/delete", authToken, async (req, res) => {
    try {
        const { trainingId } = req.body

        const deleted = await Training.findByIdAndDelete(trainingId)

        return res.status(200).send({ status: "ok", msg: 'success', deleted })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: 'Server error', error: error.message })
    }
})

module.exports = router