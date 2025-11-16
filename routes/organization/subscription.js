const express = require("express")
const router = express.Router()

const Organization = require("../../models/organization")
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


// BUY SUBSCRIPTION PLAN (ORGANIZATION)
router.post("/buy", authToken, async (req, res) => {
    try {
        const { plan_id, billing_cycle } = req.body
        const orgId = req.user.id   // coming from JWT

        if (!plan_id || !billing_cycle) {
            return res.status(400).send({ status: "error",msg: "all fields are required" })
        }

        const plan = await Subscription.findById(plan_id)
        if (!plan) {
            return res.status(404).send({ status: "error", msg: "Subscription plan not found" })
        }

        if (plan.plan_type !== "organization") {
            return res.status(400).send({ status: "error", msg: "This plan is not for organizations" })
        }

        const now = new Date()
        const end = new Date(now)

        if (billing_cycle === "monthly") end.setMonth(end.getMonth() + 1)
        else if (billing_cycle === "quarterly") end.setMonth(end.getMonth() + 3)
        else if (billing_cycle === "yearly") end.setFullYear(end.getFullYear() + 1)
        else {
            return res.status(400).send({ status: "error", msg: "Invalid billing cycle" })
        }

        const updatedOrg = await Organization.findByIdAndUpdate(
            orgId,
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

        return res.status(200).send({ status: "ok", msg: "success", data: updatedOrg })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Unexpected error", error: error.message })
    }
})


// GET ORGANIZATION'S SUBSCRIPTION
router.post("/view", authToken, async (req, res) => {
    try {
        const orgId = req.user.id   // from JWT token

        const org = await Organization.findById(orgId).populate("subscription.plan_id")

        if (!org) {
            return res.status(404).send({ status: "error", msg: "Organization not found" })
        }

        return res.status(200).send({ status: "ok", msg: "success", subscription: org.subscription
        })

    } catch (error) {
        return res.status(500).send({ status: "error", msg: "Unexpected error", error: error.message })
    }
})


module.exports = router