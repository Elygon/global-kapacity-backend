const User = require('../../models/user')
const Organization = require('../../models/organization')

// Determine model based on request or identifier
const pickupModel = (req) => {
    if (!req.user || !req.user.fromUser) return null

    if (req.user.fromUser === 'user') return User
    if (req.user.fromUser === 'organization') return Organization

    return null
}

module.exports = pickupModel