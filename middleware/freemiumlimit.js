const User = require('../models/user')
const Organization = require('../models/organization')
const Message = require('../models/message')


// Helper: Get user or organization account
const getAccount = async (id, role) => {
    if (role === 'organization') {
        return await Organization.findById(id)
    }
    return await User.findById(id)
}

// Helper: Check if premium & not expired
const isPremium = (account, role) => {
    const premiumFlag = role === 'organization'
        ? account.is_premium_org
        : account.is_premium_user

    const expired = account.expiry_date && new Date(account.expiry_date) < new Date()

    return premiumFlag && !expired
}
      

// ============================
// 1. Prevent freemium from KIP
// ============================
const preventFreemiumKIP = async (req, res, next) => {
    const account = await getAccount(req.user._id, req.user.role)
    if (!account) {
        return res.status(400).send({ status: 'error', msg: 'Account not found' })
    }

    if (!isPremium(account, req.user.role)) {
        return res.status(403).send({ status: 'error', msg: 'Freemium accounts cannot apply for KIP' })
    }

    next()
}


// ==============================================
// 2. Prevent freemium users from sending messages
// ==============================================
const preventFreemiumSendMessage = async (req, res, next) => {
    const sender = await getAccount(req.user._id, req.user.role)
    if (!sender) {
        return res.status(404).send({ status: 'error', msg: 'Account not found' })
    }

    // Premium users can send freely
    if (isPremium(sender, req.user.role)) {
        return next()
    }

    // Freemium users can ONLY reply to received messages
    const receiverId = req.body.receiverId

    const receivedBefore = await Message.findOne({
        sender: receiverId,
        receiver: req.user._id
    })

    if (!receivedBefore) {
        return res.status(403).send({ status: 'error', msg: 'Freemium accounts cannot send messages unless replying.' })
    }

    next()
}


// ====================================================
// 3. Prevent freemium from viewing detailed opportunities
// ====================================================
const preventFreemiumDetailView = async (req, res, next) => {
    const account = await getAccount(req.user._id, req.user.role)

    if (!account) {
        return res.status(404).send({ status: 'error', msg: 'Account not found' })
    }

    if (!isPremium(account, req.user.role)) {
        return res.status(403).send({ status: 'error', msg: 'Freemium users cannot view this' })
    }

    next()
}

// Export
module.exports = {
    preventFreemiumKIP,
    preventFreemiumSendMessage,
    preventFreemiumDetailView
}