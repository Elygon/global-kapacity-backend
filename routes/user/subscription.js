const express = require("express")
const router = express.Router()

const User = require("../../models/user")
const Subscription = require("../../models/subscription")
const authToken = require("../../middleware/authToken")


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
        const userId = req.user._id

        if (!plan_id || !billing_cycle) {
            return res.status(400).send({ status: "error", msg: "plan_id and billing_cycle are required" })
        }

        const plan = await Subscription.findById(plan_id)
        if (!plan) {
            return res.status(404).send({ status: "error", msg: "Subscription plan not found" })
        }

        // Check if plan is for User (assuming 'account_type' or 'plan_type' field exists in Subscription model for plans)
        // The Subscription model has 'account_type'.
        if (plan.account_type !== "user") {
            return res.status(400).send({ status: "error", msg: "This plan is not for users" })
        }

        const now = new Date()
        const end = new Date(now)

        if (billing_cycle === "monthly") end.setMonth(end.getMonth() + 1)
        else if (billing_cycle === "quarterly") end.setMonth(end.getMonth() + 3)
        else if (billing_cycle === "yearly") end.setFullYear(end.getFullYear() + 1)
        else return res.status(400).send({ status: "error", msg: "Invalid billing cycle" })

        // Create a new subscription record for history
        const newSubscription = new Subscription({
            user_id: userId,
            account_type: 'user',
            plan: billing_cycle,
            start_date: now,
            end_date: end,
            amount: plan.amount || 0,
            is_active: false // Default to false until paid
        })
        await newSubscription.save()

        // Return the subscription details for payment processing
        return res.status(200).send({ 
            status: "ok", msg: "success", data: newSubscription, subscriptionId: newSubscription._id
        })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Unexpected error", error: error.message })
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