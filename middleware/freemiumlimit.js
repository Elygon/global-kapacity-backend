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

// Middleware 1: Prevent freemium users from applying for KIP
const preventFreemiumKIP = async (req, res, next) => {
    const account = await getAccount(req.user._id, req.user.role)

    if (!account) {
        return res.status(400).send({ status: 'error', msg: 'Account not found' })
    }

    if (account.subscription.plan === 'freemium') {
        return res.status(403).send({ status: 'error', msg: 'Freemium accounts cannot apply for KIP' })
    }
    next()
}

      
 // Middleware 2: Prevent freemium users from sending messages 
const preventFreemiumSendMessage = async (req, res, next) => {
    const sender = await getAccount.findById(req.user._id, req.user.role)
    if (!sender) {
        return res.status(404).send({ status: 'error', msg: 'Account not found' })
    }

    // premium - allow 
    if (sender.subscription_plan === 'premium') {
        return next()
    }

    // freemium can reply ONLY if they received a message before
    const receiverId = req.body.receiverId

    const receivedBefore = await Message.findOne({
        sender: receiverId,
        receiver: req.user._id
    })

    if (!receivedBefore) {
        return res.status(400).send({ status: 'error', msg: 'Freemium accounts cannot send messages unless they are replying.' })
    }
    next()
}

// Export both
module.exports = {
    preventFreemiumKIP,
    preventFreemiumSendMessage
}