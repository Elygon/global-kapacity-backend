const express = require("express")
const router = express.Router()

const Subscription = require("../../models/subscription")
const authToken = require("../../middleware/authToken")


// CREATE SUBSCRIPTION PLAN (ADMIN ONLY)
router.post("/create", authToken, async (req, res) => {
    try {
        const plan = await Subscription.create(req.body)

        return res.status(201).json({ status: "ok", msg: "success", data: plan })

    } catch (error) {
        return res.status(500).json({ status: "error", msg: "Server error", error: error.message })
    }
})


// UPDATE SUBSCRIPTION PLAN (ADMIN ONLY)
router.post("/update", authToken, async (req, res) => {
    try {
        const { plan_id, ...updateData } = req.body

        if (!plan_id) {
            return res.status(400).send({ status: "error", msg: "Plan_id is required" })
        }

        const updated = await Subscription.findByIdAndUpdate(plan_id, updateData, { new: true })

        if (!updated) {
            return res.status(404).send({ status: "error", msg: "Subscription plan not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", data: updated })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ACTIVATE / DEACTIVATE PLAN
router.post("/toggle", authToken, async (req, res) => {
    try {
        const { plan_id } = req.body

        if (!plan_id) {
            return res.status(400).send({ status: "error", msg: "Plan_id is required" })
        }

        const plan = await Subscription.findById(plan_id)

        if (!plan) {
            return res.status(404).send({ status: "error", msg: "Subscription plan not found" })
        }

        // toggle status
        plan.isActive = !plan.isActive
        await plan.save()

        return res.status(200).send({ status: "ok", msg: 'success', statusValue: plan.isActive })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// GET ALL PLANS
router.post("/all", async (req, res) => {
    try {
        const plans = await Subscription.find()

        return res.status(200).send({ status: "ok", msg: "success", data: plans })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})

module.exports = router