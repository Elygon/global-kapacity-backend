const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../../models/user')
const Organization = require('../../models/organization')
const authToken = require('../../middleware/authToken')
const { sendPasswordReset, sendPasswordResetOrg } = require("../../utils/nodemailer")
const Statistics = require('../../models/statistics')

const Otp = require('../../models/otp')
const { createOtp, validateOtp, deleteOtp } = require('../../services/otp_service')

/**
 * Stage 2 - Verify OTP & create account (generalized)
 * body: { ownerId, ownerType, otp }
 */
router.post('/verify_account', async (req, res) => {
  try {
    const { ownerId, ownerType, otp } = req.body;

    if (!ownerId || !ownerType || !otp) {
      return res.status(400).send({ status: 'error', msg: 'All fields are required' })
    }

    if (!['user', 'organization'].includes(ownerType)) {
      return res.status(400).send({ status: 'error', msg: 'Invalid owner type' })
    }

    // Validate OTP
    const isValid = await validateOtp(ownerId, ownerType, 'verify_account', otp)
    if (!isValid) return res.status(400).send({ status: 'error', msg: 'Invalid or expired OTP' })

    // Fetch the OTP entry to get the payload
    const otpEntry = await Otp.findOne({
      owner_id: ownerId,
      owner_type: ownerType,
      purpose: 'verify_account',
      code: otp,
    })

    if (!otpEntry || !otpEntry.payload) {
      return res.status(400).send({ status: 'error', msg: 'No signup data found for this OTP' })
    }

    const payload = otpEntry.payload

    // Hash password
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10)
    }

    // Create account
    const Model = ownerType === 'user' ? User : Organization
    const account = await Model.create(payload)

    // Generate JWT
    const token = jwt.sign({ _id: account._id, email: account.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Clean up OTP
    await deleteOtp(ownerId, ownerType, 'verify_account')

    // Update statistics if needed
    if (ownerType === 'organization') {
      await Statistics.updateOne({}, { $inc: { no_of_organizations: 1 } }, { upsert: true })
    }

    return res.status(200).send({ status: 'ok', msg: 'success', account, token })

  } catch (err) {
    return res.status(500).send({ status: 'error', msg: 'Error occurred', error: err.message })
  }
})


//endpoint for user/organization to sign in
router.post('/sign_in', async(req, res) => {
    const {email, phone_no, password, owner_type} = req.body

    if (!owner_type || !['user', 'organization'].includes(owner_type))
      return res.status(400).send({ status: 'error', msg: 'Invalid owner type'})
    
    if ((!email && !phone_no) || !password)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
      // Choose model based on owner type
      const model = owner_type === 'user' ? User : Organization

      //Build search conditions
      const conditions = []
      if (email) conditions.push({ email })
      if (phone_no) conditions.push({ phone_no })

      if (conditions.length === 0) {
          return res.status(400).send({ status: 'error', msg: 'Email or phone number required' });
      }

        let account = await model.findOne({ $or: conditions }).lean()
        if (!account) {
          return res.status(400).send({ status: 'error', msg: 'No account found with the provided email or phone'})
        }

        // Require verification
        if (!account.is_verified) {
            return res.status(400).send({ status: "error", msg: "Please verify your account first." })
        }

        // check if blocked banned or deleted
        if (account.is_blocked) {
            return res.status(400).send({ status: "error", msg: "Account blocked" })
        }
        
        if (account.is_banned) {
            return res.status(400).send({ status: "error", msg: "Account banned" })
        }

        if (account.is_deleted) {
            return res.status(400).send({ status: "error", msg: "Account deleted" })
        }

        //compare passwords
        const correct_password = await bcrypt.compare(password, account.password)
        if(!correct_password)
            return res.status(400).send({status: 'error', msg:'Password is incorrect'})

        // create token
        const token = jwt.sign({
            _id: account._id,
            owner_type,
            email: account.email,
            phone_no: account.phone_no
        }, process.env.JWT_SECRET, {expiresIn: '1h'})

        // Mark user/organization online
        account = await model.findOneAndUpdate({_id: account._id}, {is_online: true}, {new: true}).lean()

        //send response
        res.status(200).send({status: 'ok', msg: 'success', account, token})
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({status: 'error', msg:'An error occured'})  
    }
})


// Change password for both user/organization
router.post('/change_password', authToken, async(req, res)=>{
    const {old_password, new_password, confirm_new_password} = req.body

    //check if fields are passed correctly
    if(!old_password || !new_password || !confirm_new_password) {
       return res.status(400).send({status: 'error', msg: 'all fields must be filled'})
    }

    try {
      // auto-detect model using token
      const Model = req.user.type === 'organization' ? Organization : User

      // get account
      const account =  await Model.findById(req.user._id).select("password")

      if (!account) {
           return res.status(400).send({status:'error', msg:'Account not found'})
      }

      //Compare old password
      const check = await bcrypt.compare(old_password, account.password)
      if(!check){
          return res.status(400).send({status:'error', msg:'old password is incorrect'})
      }

      //Prevent reusing old password
      const reuse = await bcrypt.compare(new_password, account.password)
      if(reuse){
          return res.status(400).send({status:'error', msg:'New password must be different from old password'})
      }

      //Confirm new passwords match
      if (new_password !== confirm_new_password) {
          return res.status(400).send({status: 'error', msg: 'Password mismatch'})
      }

      //Hash new password and update
      const updatePassword = await bcrypt.hash(confirm_new_password, 10)
      await Model.findByIdAndUpdate(req.user._id, {password: updatePassword})

      return res.status(200).send({status: 'ok', msg: 'success'})
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
        console.log(error)
        return res.status(401).send({status: 'error', msg: 'Token Verification Failed', error: error.message})
}
      return res.status(500).send({status: 'error', msg: 'An error occured', error: error.message})}
})



//endpoint to Logout for user/organization
router.post('/logout', authToken, async(req, res) => {
    try {
        const Model = req.user.type === 'organization' ? Organization : User

        // Set user/organization offline
        await Model.findByIdAndUpdate(req.user._id, { is_online: false })
    
        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (error) {
        console.log(error)
        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})    
    }
})


// endpoint for a user/organization to reset their password
router.post('/forgot_password', async (req, res) => {
    const { email /*, phone_no*/ } = req.body

    if (!email /*&& !phone_no*/) {
        return res.status(400).send({ status: 'error', msg: 'Email is required' });
    }

    try {
        /*
        // Corrected Query Logic
        const conditions = []
        if (email) conditions.push({ email })
        if (phone_no) conditions.push({ phone_no })

        if (conditions.length === 0) {
            return res.status(400).send({ status: 'error', msg: 'Email or phone number required' });
        }

        // Fetch user using only valid conditions
        let user = await User.findOne({ $or: conditions }).lean()

        if (!user) {
            return res.status(400).send({ status: 'error', msg: 'No account found with the provided email or phone' });
        }
        */  
       
        // Fetch user first
        let account = await User.findOne({ email }).lean()

        // If not user, try organization
        if (!account) {
          account = await Organization.findOne({ email }).lean()
          type = account ? 'organization' : null
        }

        // If neither found
        if (!account) {
            return res.status(400).send({ status: 'error', msg: 'No account found with the provided email' })
        }

        // Create reset token (expires in 15 min)
        const resetToken = jwt.sign(
            { _id: account._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        // Send appropriate email (or SMS later if implemented)
        if (type === 'user') {
          await sendPasswordReset(account.email /*|| account.phone_no*/, account.firstname, resetToken)
        } else {
          await sendPasswordResetOrg(account.email /*|| account.phone_no*/, account.company_name, resetToken)
        }

        return res.status(200).send({ status: 'ok', msg: 'Password reset link sent. Please check your email.' })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})


// endpoint to reset password webpage
router.get("/reset_password/:resetPasswordCode", async (req, res) => {
const resetPasswordCode = req.params.resetPasswordCode
    try {
      const data = jwt.verify(resetPasswordCode, process.env.JWT_SECRET)
  
      const sendTime = data.timestamp;
      // check if more than 5 minutes has elapsed
      const timestamp = Date.now()
      if (timestamp > sendTime) {
        console.log("handle the expiration of the request code")
      }
  
      return res.send(`<!DOCTYPE html>
      <html>
          <head>
              <title>Forgot Password</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">    
              <style>
                  body {
                      font-family: Arial, Helvetica, sans-serif;
                      margin-top: 10%;
                  }
                  form{
              width: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 26%;
              margin-top: 0%;
          }
              @media screen and (max-width: 900px) {
                  form{
              width: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
                  }
              
  
              }
                  input[type=text]
              {
                      width: 100%;
                      padding: 12px 20px;
                      margin: 8px 0;
                      display: inline-block;
                      border: 1px solid #ccc;
                      box-sizing: border-box;
                  }
  
                  button {
                      background-color: #04AA6D;
                      color: white;
                      padding: 14px 20px;
                      margin: 8px 0;
                      border: none;
                      cursor: pointer;
                      width: 100%;
                  }
  
                  button:hover {
                      opacity: 0.8;
                  }   
  
                  .container {
                      padding: 16px;
                  }
  
                  span.psw {
                      float: right;
                      padding-top: 16px;
                  }
  
                  /* Change styles for span and cancel button on extra small screens */
                  @media screen and (max-width: 300px) {
                      span.psw {
                          display: block;
                          float: none;
                      }
  
                      .cancelbtn {
                          width: 100%;
                      }
                  }
              </style>
          </head>
          <body>    
                  <h2 style="display: flex; align-items: center; justify-content: center; margin-bottom: 0;">Recover Account</h2>
                  <h6 style="display: flex; align-items: center; justify-content: center; font-weight: 200;">Enter the new password
                      you want to use in recovering your account</h6>    
          
              <form action="http://localhost:7000/auth_generalAuth/reset_password" method="post">
                  <div class="imgcontainer">
                  </div>
                  <div class="container">
                    <input type="password" placeholder="Enter new password" name="new_password" required style="border-radius: 5px" minlength="11">
                    <input type="password" placeholder="Confirm new password" name="confirm_password" required style="border-radius: 5px" minlength="11">
                    <input type="hidden" name="resetPasswordCode" value="${resetPasswordCode}"><br>
                    <button type="submit" style="border-radius: 5px; background-color: #1aa803">Submit</button>
                  </div>
                </form>
          </body>
  
      </html>`)
    } catch (e) {
        if (e.name === 'JsonWebTokenError') {
          // Handle general JWT errors
          console.error('JWT verification error:', e.message);
          return res.status(401).send(`</div>
          <h1>Password Reset</h1>
          <p>Token verification failed</p>
          </div>`);
        } else if (e.name === 'TokenExpiredError') {
          // Handle token expiration
          console.error('Token has expired at:', e.expiredAt);
          return res.status(401).send(`</div>
          <h1>Password Reset</h1>
          <p>Token expired</p>
          </div>`);
        } 
      console.log(e);
      return res.status(200).send(`</div>
      <h1>Password Reset</h1>
      <p>An error occured!!! ${e.message}</p>
      </div>`)
    }
  })
  
  // endpoint to reset password
  router.post("/reset_password", async (req, res) => {
    const { new_password, confirm_password, resetPasswordCode } = req.body
  
    if (!new_password || !confirm_password || !resetPasswordCode) {
      return res
        .status(400)
        .json({ status: "error", msg: "All fields must be entered" })
    }

    // Check password equality
    if (new_password !== confirm_password) {
    return res
        .status(400)
        .json({ status: "error", msg: "Passwords do not match" })
    }

    // (Optional) check minimum length / complexity on the server side too
    if (new_password.length < 11) {
    return res
        .status(400)
        .json({ status: "error", msg: "Password must be at least 11 characters" })
    }
  
    try {
      const data = jwt.verify(resetPasswordCode, process.env.JWT_SECRET)

      // Detect the correct model
      let account = await User.findById(data._id)
      let modelName = 'User'

      if (!account) {
        account = await Organization.findById(data._id)
        modelName = 'Organization'
      }

      if (!account) {
        return res.status(400).send(`<h1>Password Reset</h1>No account found<p>`) 
      }

      const hashedPassword = await bcrypt.hash(new_password, 15)

      account.password = hashedPassword
      await account.save()

      // return a response which is a web page
      return res.status(200).send(`</div>
      <h1>Password Reset</h1>
      <p>Your password has been reset successfully!!!</p>
      <p>You can now login with your new password.</p>
      </div>`)
    } catch (e) {
        if (e.name === 'JsonWebTokenError') {
          // Handle general JWT errors
          console.error('JWT verification error:', e.message);
          return res.status(401).send(`</div>
          <h1>Password Reset</h1>
          <p>Token verification failed</p>
          </div>`);
        } else if (e.name === 'TokenExpiredError') {
          // Handle token expiration
          console.error('Token has expired at:', e.expiredAt);
          return res.status(401).send(`</div>
          <h1>Password Reset</h1>
          <p>Token expired</p>
          </div>`);
        } 
      console.log("error", e);
      return res.status(200).send(`</div>
      <h1>Reset Password</h1>
      <p>An error occured!!! ${e.message}</p>
      </div>`)
    }
})


//endpoint to delete account
router.post('/delete', authToken, async(req, res) => {
    try {
      const accountId = req.user._id // for user & organization

        //Delete from User model
        let deleted = await User.findByIdAndDelete(accountId)

        // If not found, try Organization model
        if (!deleted) {
          deleted = await Organization.findByIdAndDelete(accountId)
        }

        // Still not found?
        if(!deleted)
            return res.status(400).send({status: 'error', msg: 'No account found'})

        return res.status(200).send({status: 'ok', msg: 'success'})

    } catch (error) {
        console.log(error)

        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})    
    }

})


module.exports = router