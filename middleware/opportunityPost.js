const User = require('../models/user')
const Organization = require('../models/organization')



// =========================
// INDIVIDUAL PREMIUM CHECK
// =========================
const isPremiumUser = async (req, res, next) => {
    if (!req.user?._id) {
        return res.status(401).send({ status: "error", msg: "Unauthorized" })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
        return res.status(404).send({ status: "error", msg: "User not found" })
    }

    const isExpired = user.expiry_date && new Date(user.expiry_date) < new Date()

    if (!user.is_premium_user || isExpired) {
        return res.status(403).send({ status: "error", msg: "Only premium users can post opportunities except jobs" })
    }

    next() 
}


// =========================
// ORGANIZATION PREMIUM CHECK
// =========================
const isPremiumOrg = async (req, res, next) => {
    if (!req.user?._id) {
        return res.status(401).send({ status: "error", msg: "Unauthorized" })
    }

    const org = await Organization.findById(req.user._id)

    if (!org) {
        return res.status(404).send({ status: "error", msg: "Organization not found" })
    }

    const isExpired = org.expiry_date && new Date(org.expiry_date) < new Date()

    if (!org.is_premium_org || isExpired) {
        return res.status(403).send({ status: "error", msg: "Only premium organizations can post job opportunities" })
    }

    next()
}

module.exports = { isPremiumUser, isPremiumOrg }
