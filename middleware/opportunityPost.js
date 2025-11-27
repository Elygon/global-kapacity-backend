const User = require("../models/user")
const Organization = require('../models/organization')


// Middleware 1: Prevent freemium users from posting opportunities
const isPremiumUser = async (req, res, next) => {
    if (!req.user?._id) {
        return res.status(401).send({ status: "error", msg: "Unauthorized" });
    }

    const user = await User.findById(req.user._id)

    if (!user || user.subscription?.status !== "active") {
        return res.status(403).send({ status: "error", msg: "Only premium users can post opportunities" })
    }

    next()
}


// Middleware 2: Only Organization premium users can post job opporrtunites
const isPremiumOrganization = async (req, res, next) => {
    if (!req.user?._id) {
        return res.status(401).send({ status: "error", msg: "Unauthorized" });
    }

    const user = await User.findById(req.user._id)

    // Must be premium + organization
    const isPremium = user.subscription?.status === "active"
    const isOrg = user.account_type === "organization"

    if (!isPremium || !isOrg) {
        return res.status(403).send({ status: "error", msg: "Only premium organizations can post job opportunities" })
    }

    next()
}


module.exports = { isPremiumUser, isPremiumOrganization }