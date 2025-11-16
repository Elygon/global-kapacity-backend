const express = require("express")
const router = express.Router()

const User = require("../../models/user")
const Subscription = require("../../models/subscription")
const authToken = require("../../middleware/authToken")   // corrected path


// GET ALL PLANS
router.post("/all", async (req, res) => {
    try {
        const plans = await Subscription.find()

        return res.status(200).send({ status: "ok", msg: "success", data: plans })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// BUY SUBSCRIPTION PLAN (USER)
router.post("/buy", authToken, async (req, res) => {
    try {
        const { plan_id, billing_cycle } = req.body
        const userId = req.user._id   // coming from authToken

        if (!plan_id || !billing_cycle) {
            return res.status(400).send({ status: "error", msg: "plan_id and billing_cycle are required" })
        }

        const plan = await Subscription.findById(plan_id)
        if (!plan) {
            return res.status(404).send({ status: "error", msg: "Subscription plan not found" })
        }

        if (plan.plan_type !== "User") {
            return res.status(400).send({ status: "error", msg: "This plan is not for users" })
        }

        const now = new Date()
        const end = new Date(now)

        if (billing_cycle === "monthly") end.setMonth(end.getMonth() + 1)
        else if (billing_cycle === "quarterly") end.setMonth(end.getMonth() + 3)
        else if (billing_cycle === "yearly") end.setFullYear(end.getFullYear() + 1)
        else return res.status(400).send({ status: "error", msg: "Invalid billing cycle" })

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                subscription: {
                    plan_id,
                    billing_cycle,
                    start_date: now,
                    end_date: end,
                    status: "active"
                }
            },
            { new: true }
        )

        return res.status(200).send({ status: "ok", msg: "success", data: updatedUser })

    } catch (error) { 
        return res.status(500).send({ status: "error", msg: "Unexpected error", error: error.message})
    }
})


// GET USER SUBSCRIPTION
router.post("/view", authToken, async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId).populate("subscription.plan_id")

        if (!user) {
            return res.status(404).send({ status: "error", msg: "User not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", subscription: user.subscription })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Unexpected error", error: error.message })
    }
})


module.exports = router