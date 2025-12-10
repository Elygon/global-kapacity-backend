// Import the JSON Web Token (JWT) library for verifying tokens
const jwt = require('jsonwebtoken')

// Import your database models (User, Organization and Admin)
const User = require('../models/user')
const Admin = require('../models/admin')
const Organization = require('../models/organization')

// Authentication middleware to protect routes
const auth = async (req, res, next) => {
  try {
    // Get the 'Authorization' header from the request
    const authHeader = req.header('Authorization')

    // If the header starts with "Bearer ", remove it and extract only the token.
    // Otherwise, check for an 'x-auth-token' header (some clients use that instead).
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.header('x-auth-token')

    // If there’s no token at all, deny access.
    if (!token) {
      return res.status(401).json({ status: 'error', msg: 'No token provided' })
    }

    // Get the "From" header (this tells us who is making the request)
    // Example: From: user  OR  From: admin
    const from = req.header('From')

    // If the 'From' header is missing, reject the request
    if (!from) {
      return res.status(401).json({ status: 'error', msg: 'From header must be set (user/organization/admin)' })
    }

    // Verify the token using your secret key from the .env file
    // This decodes the token and gives access to the payload (e.g., the user's ID)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Store the token on the request object (optional but useful later)
    req.token = token;

    // ==============================
    // 👇🏽 CASE 1: If the request came from a user
    // ==============================
    if (from === 'user') {
      // Find the user in the database using the decoded ID
      const user = await User.findById(decoded._id).lean()

      // If no user matches that token, deny access
      if (!user) return res.status(401).json({ status: 'error', msg: 'User not found' })

      // If user account is blocked or deleted, deny access
      if (user.is_blocked || user.is_deleted)
        return res.status(403).json({ status: 'error', msg: 'User account blocked or deleted' })


      // Attach user info and role ("user") to the request
      req.user = { ...user, type: 'user', from: 'user' }

      // Continue to the next middleware or route
      next()
    } 


    // ==============================
    // 👇🏽 CASE 2: If the request came from a signed-up organizatoon
    // ==============================
    else if (from === 'organization') {
      // Find the admin in the database using the decoded ID
      const organization = await Organization.findById(decoded._id).lean()

      // If no organization found, deny access
      if (!organization) return res.status(401).json({ status: 'error', msg: 'Organization not found' })

      // If organization account is blocked or deleted, deny access
      if (organization.is_blocked || organization.is_deleted)
        return res.status(403).json({ status: 'error', msg: 'Organization account blocked or deleted' })

      // Attach organization info and role ("organization") to the request
      req.user = { ...organization, type: 'organization', from: 'organization' }

      // Continue to the next middleware or route
      next()
    } 


    // ==============================
    // 👇🏽 CASE 3: If the request came from a admin member
    // ==============================
    else if (from === 'admin') {
      // Find the admin in the database using the decoded ID
      const admin = await Admin.findById(decoded._id).lean()

      // If no admin found, deny access
      if (!admin) return res.status(401).json({ status: 'error', msg: 'Admin not found' })

      // If admin account is blocked or deleted, deny access
      if (admin.is_blocked || admin.is_deleted)
        return res.status(403).json({ status: 'error', msg: 'Admin account blocked or deleted' })

      // Attach admin info and role ("admin") to the request
      req.user = { ...admin, type: 'admin', from: 'admin' }

      // Continue to the next middleware or route
      next()
    } 


    // ==============================
    // 👇🏽 CASE 4: Invalid "From" header value
    // ==============================
    else {
      return res.status(400).json({ status: 'error', msg: 'Invalid From header value' })
    }
  } 
  catch (error) {
    // If token is expired, handle it clearly
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ status: 'error', msg: 'Token expired' })

    // If token is invalid or malformed
    if (error.name === 'JsonWebTokenError')
      return res.status(401).json({ status: 'error', msg: 'Invalid token' })

    // If some unexpected server error occurs
    console.error('Auth middleware error:', error)
    res.status(500).json({ status: 'error', msg: 'Server error during authentication' })
  }
}

// Export the middleware so you can use it in your routes
module.exports = auth