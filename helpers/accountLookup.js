const User = require('../../models/user')
const Organization = require('../../models/organization')

// unified lookup for individual or organization accounts
const findAccount = async ({ email, phone_no }) => {
  const conditions = []
  if (email) conditions.push({ email })
  if (phone_no) conditions.push({ phone_no })

  if (conditions.length === 0) return null

  // Search in both collections
  let account = await User.findOne({ $or: conditions }).lean()
  if (!account) account = await Organization.findOne({ $or: conditions }).lean()

  return account
}

module.exports = findAccount