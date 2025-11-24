const User = require('../models/user')

// Middleware 1: Prevent freemium users from applying for KIP
const preventFreemiumKIP = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        return res.status(404).send({ status: 'error', msg: 'User not found' })
    }

    if (user.subscription_plan === 'Freemium') {
        return res.status(403).send({ status: 'error', msg: 'Freemium users cannot apply for KIP' })
    }
    next()
}

      
 // Middleware 2: Prevent freemium users from sending messages 
const preventFreemiumSendMessage = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        return res.status(404).send({ status: 'error', msg: 'User not found' })
    }

    if (user.subscription_plan === 'Freemium') {
        return res.status(403).send({ status: 'error', msg: 'Freemium users cannot send messages' })
    }
    next()
}

// Export both
module.exports = {
    preventFreemiumKIP,
    preventFreemiumSendMessage
}