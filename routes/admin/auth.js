const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authToken = require('../../middleware/authToken')
const Admin = require('../../models/admin')

const { sendPasswordResetAdmin } = require("../../utils/nodemailer")



//endpoint to Login
router.post('/sign_in', async(req, res) => {
    const {email, phone_no, password} = req.body
    if ((!email && !phone_no) || !password)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
        // Corrected Query Logic
        const conditions = []
        if (email) conditions.push({ email })
        if (phone_no) conditions.push({ phone_no })

        if (conditions.length === 0) {
            return res.status(400).send({ status: 'error', msg: 'Email or phone number required' });
        }

        // Fetch staff using only valid conditions
        let admin = await Admin.findOne({ $or: conditions }).lean()
        if(!admin) 
            return res.status(400).send({status: 'error', msg:'No admin account found with the provided email or phone number'})

        // check if staff's account has been verified
        /*
        if (staff.is_verified) {
            return res.status(400).send({ status: "error", msg: "Please verify your account first." })
        }*/

        // check if blocked
        if (admin.is_blocked === true) {
            return res.status(400).send({ status: "error", msg: "account blocked" })
        }
        
        // check if banned
        if (admin.is_banned === true) {
            return res.status(400).send({ status: "error", msg: "account banned" })
        }

        // check if deleted
        if (admin.is_deleted === true) {
            return res.status(400).send({ status: "error", msg: "account deleted" })
        }

        //compare password
        const correct_password = await bcrypt.compare(password, admin.password)
        if(!correct_password)
            return res.status(400).send({status: 'error', msg:'Password is incorrect'})

        // create token
        const token = jwt.sign({
            _id: admin._id,
            email: admin.email,
            phone_no: admin.phone_no
        }, process.env.JWT_SECRET, {expiresIn: '1h'})

        //update admin document to online
        admin = await Admin.findOneAndUpdate({_id: admin._id}, {is_online: true}, {new: true}).lean()

        //send response
        res.status(200).send({status: 'ok', msg: 'success', admin, token})
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({status: 'error', msg:'An error occured'})  
    }
})

//endpoint to Logout
router.post('/logout', authToken, async(req, res) => {
    try {
        const adminId = req.user._id

        // Set admin offline
        await Admin.findByIdAndUpdate(adminId, { is_online: false })
    
        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (error) {
        console.log(error)
        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})    
    }
})


// endpoint for a admin to reset their password
router.post('/forgot_password', async (req, res) => {
    const { email, phone_no } = req.body

    if (!email && !phone_no) {
        return res.status(400).send({ status: 'error', msg: 'Email or phone number is required' });
    }

    try {
        // Corrected Query Logic
        const conditions = []
        if (email) conditions.push({ email })
        if (phone_no) conditions.push({ phone_no })

        if (conditions.length === 0) {
            return res.status(400).send({ status: 'error', msg: 'Email or phone number required' });
        }

        // Fetch admin using only valid conditions
        let admin = await Admin.findOne({ $or: conditions }).lean()

        if (!admin) {
            return res.status(400).send({ status: 'error', msg: 'No admin account found with the provided email or phone' });
        }

        // Create reset token (expires in 10 min)
        const resetToken = jwt.sign(
            { _id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        // Send email to admin email only
        await sendPasswordResetAdmin(admin.email  || admin.phone_no, admin.firstname, resetToken);

        return res.status(200).send({ status: 'ok', msg: 'Password reset link sent. Please check your email or phone.' })

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
          
              <form action="http://localhost:7000/admin_auth/reset_password" method="post">
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
    return res.status(400).json({ status: "error", msg: "All fields must be entered" })
}

    // Check password equality
    if (new_password !== confirm_password) {
    return res
        .status(400)
        .json({ status: "error", msg: "Passwords do not match" });
    }

    // (Optional) check minimum length / complexity on the server side too
    if (new_password.length < 11) {
    return res
        .status(400)
        .json({ status: "error", msg: "Password must be at least 11 characters" });
    }
  
    try {
      const data = jwt.verify(resetPasswordCode, process.env.JWT_SECRET)
      const hashedPassword = await bcrypt.hash(new_password, 10)

      console.log("Resetting password for admin ID:", data._id)

  
      // update the phone_no field
      await Admin.updateOne(
        { _id: data._id },
        {
          $set: { password: hashedPassword } ,
        }
      );
  
      // return a response which is a web page
      return res.status(200).send(`</div>
      <h1>Reset Password</h1>
      <p>Your password has been reset successfully!!!</p>
      <p>You can now login with your new password.</p>
      </div>`);
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


module.exports = router