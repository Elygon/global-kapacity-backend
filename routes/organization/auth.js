const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Organization = require('../../models/organization')

const { sendOTP, sendPasswordReset } = require("../../utils/nodemailer")
const sendMessage = require("../../utils/africastalking")
const {sendWhatsappOtp, sendSmsOtp} = require("../../utils/twilio")

// Import middleware that verifies guest token
const authToken = require('../../middleware/authToken')

let OTP, user



// google signup/login endpoint
router.post('/google', async (req, res) => {
  try {
    const { name_of_organization, company_reg_no, industry, email } = req.body

    // Check if organization exists
    let org = await Organization.findOne({ email, authProvider: 'google' })

    if (!org) {
      // SIGNUP: industry is required
      if (!industry) {
        return res.status(400).send({ success: false, message: 'Industry is required for signup' })
      }

      org = await Organization.create({
        name_of_organization,
        company_reg_no,
        industry,
        email,
        authProvider: 'google',
        isVerified: true, // Google verified
      })
    }

    // LOGIN or SIGNUP: generate JWT
    const token = jwt.generateToken({ id: org._id })

    return res.status(200).send({
      status: 'ok',
      msg: 'success',
      token,
      organization: org
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Server error' })
  }
})


// apple signup/login endpoint
router.post('/apple', async (req, res) => {
  try {
    const { name_of_organization, company_reg_no, industry, email } = req.body;

    // Check if organization exists
    let org = await Organization.findOne({ email, authProvider: 'apple' });

    if (!org) {
      // SIGNUP: industry is required
      if (!industry) {
        return res.status(400).send({ success: false, message: 'Industry is required for signup' });
      }

      org = await Organization.create({
        name_of_organization,
        company_reg_no,
        industry,
        email,
        authProvider: 'apple',
        isVerified: true, // Apple verified
      })
    }

    // LOGIN or SIGNUP: generate JWT
    const token = jwt.generateToken({ id: org._id })

    return res.status(200).send({
      status: 'ok',
      msg: 'success',
      token,
      organization: org
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ success: false, message: 'Server error' })
  }
})


/**
 * endpoint for organization to signup(send otp stage)
 * @param phone_no  {string} must be in +234 format
 */
router.post("/signup_stage_one", async (req, res) => {
  const { name_of_organization, company_reg_no, industry, email, phone_no, password, preferred_method } = req.body;

  // check for required fields
  if (!name_of_organization || !company_reg_no || !industry || !email || !phone_no || !password || !preferred_method)
    return res
      .status(400)
      .send({ status: "error", msg: "required fields must be filled" });

  try {
    // check for duplicate email
    let found = await Organization.findOne({ email, is_deleted: false }).lean();
    if (found)
      return res.status(400).send({
        status: "error",
        msg: "an account with this email already exists",
      });

    // check for duplicate phone number
    let found2 = await Organization.findOne({ phone_no, is_deleted: false }).lean();
    if (found2)
      return res.status(400).send({
        status: "error",
        msg: "an account with this phone number already exists",
      });

    // check if password matches
    if (password !== confirm_password)
      return res
        .status(400)
        .send({ status: "error", msg: "password missmatch" });

    // authenticate phone_number by sending otp
    OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += process.env.TWILIO_DIGITS[Math.floor(Math.random() * 10)];
    }

    // handle logic for pereferred method
    if (preferred_method === "email") {
      sendOTP(email, OTP);
    } else if (preferred_method === "sms") {
      sendSmsOtp(phone_no, OTP);
    } else if (preferred_method === "whatasapp") {
      // await sendWhatsappOtp(phone_no, OTP); //  TODO: Comment out later
      sendSmsOtp(phone_no, OTP);
    }

    // // remove when above code is uncommented out
    // sendOTP(email, OTP);

    return res.status(200).send({ status: "ok", msg: "success" });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .send({ status: "error", msg: "some error occurred", error: e.message });
  }
});


// endpoint for organization to signup(verify otp stage)
router.post("/signup_stage_two", async (req, res) => {
  const { otp, name_of_organization, company_reg_no, industry, email, phone_no, password, confirm_password } = req.body;

  // check for required fields
  if (!name_of_organization || !company_reg_no || !industry || !email || !phone_no || !password || !otp || !password || !confirm_password)
    return res
      .status(400)
      .send({ status: "error", msg: "required fields must be filled" });

  try {
    if (otp != OTP) {
      return res.status(400).send({ status: "error", msg: "Incorrect OTP" });
    }
    OTP = "";

    const timestamp = Date.now();

    const organization = new Organization();
    organization.name_of_organization = name_of_organization;
    organization.company_reg_no = company_reg_no;
    organization.industry = industry;
    organization.email = email;
    organization.phone_no = phone_no || "";
    organization.google_id = "";
    organization.img_url = "";
    organization.img_id = "";
    organization.timestamp = timestamp;
    organization.password = await bcrypt.hash(password, 10);

    await organization.save();

    /*
    // create call document
    const call = new Call();
    call.user_id = user._id;
    call.designation = "";
    call.channel_name = "";
    call.call_token = "";
    call.firstname = "";
    call.lastname = "";
    call.img_url = "";
    call.timestamp = Date.now();

    await call.save();
    */

    // generate token
    const token = jwt.sign(
      {
        _id: organization._id,
        email: organization.email,
      },
      process.env.JWT_SECRET
    );

    await Statistics.updateOne(
      {},
      {
        $inc: {
          no_of_organizations: 1,
        },
      },
      { upsert: true }
    );

    return res.status(200).send({ status: "ok", msg: "success", organization, token });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .send({ status: "error", msg: "some error occurred", error: e.message });
  }
})


//endpoint for organization to sign in
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

        // Fetch guest using only valid conditions
        let organization = await Organization.findOne({ $or: conditions }).lean()
        if(!organization)
            return res.status(400).send({
        status: 'error', msg:'No account found with the provided email or phone number'})

        // check if organization's account has been verified
        if (organization.is_verified) {
            return res.status(400).send({ status: "error", msg: "Please verify your account first." })
        }

        // check if blocked
        if (organization.is_blocked === true) {
            return res.status(400).send({ status: "error", msg: "account blocked" })
        }
        
        // check if banned
        if (organization.is_banned === true) {
            return res.status(400).send({ status: "error", msg: "account banned" })
        }

        // check if deleted
        if (organization.is_deleted === true) {
            return res.status(400).send({ status: "error", msg: "account deleted" })
        }

        //compare password
        const correct_password = await bcrypt.compare(password, organization.password)
        if(!correct_password)
            return res.status(400).send({status: 'error', msg:'Password is incorrect'})

        // create token
        const token = jwt.sign({
            _id: organization._id,
            email: organization.email,
            phone_no: organization.phone_no
        }, process.env.JWT_SECRET, {expiresIn: '1h'})

        //update guest document to online
        organization = await Organization.findOneAndUpdate({_id: organization._id}, {is_online: true}, {new: true}).lean()

        //send response
        res.status(200).send({status: 'ok', msg: 'success', organization, token})
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({status: 'error', msg:'An error occured'})  
    }
})

//endpoint to Logout
router.post('/logout', authToken, async(req, res) => {
    try {
        const organizationId = req.user._id

        // Set guest offline
        await Organization.findByIdAndUpdate(organizationId, { is_online: false })
    
        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (error) {
        console.log(error)
        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})    
    }
})


// endpoint to change password
router.post('/change_password', authToken, async(req, res)=>{
    const {old_password, new_password, confirm_new_password} = req.body

    //check if fields are passed correctly
    if(!old_password || !new_password || !confirm_new_password){
       return res.status(400).send({status: 'error', msg: 'all fields must be filled'})
    }

    // get organization document and change password
    try {
        const organization =  await Organization.findById(req.user._id).select("password")

        if (!organization) {
            return res.status(400).send({status:'error', msg:'organization not found'})
        }

        //Compare old password
        const check = await bcrypt.compare(old_password, organization.password)
        if(!check){
            return res.status(400).send({status:'error', msg:'old password is incorrect'})
        }

        //Prevent reusing old password
        const isSamePassword = await bcrypt.compare(new_password, organization.password)
        if(isSamePassword){
            return res.status(400).send({status:'error', msg:'New password must be different from the old password'})
        }

        //Confirm new passwords match
        if (new_password !== confirm_new_password) {
            return res.status(400).send({status: 'error', msg: 'Password mismatch'})
        }

        //Hash new password and update
        const updatePassword = await bcrypt.hash(confirm_new_password, 10)
        await Organization.findByIdAndUpdate(req.user._id, {password: updatePassword})

        return res.status(200).send({status: 'ok', msg: 'success'})
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
        console.log(error)
        return res.status(401).send({status: 'error', msg: 'Token Verification Failed', error: error.message})
}
      return res.status(500).send({status: 'error', msg: 'An error occured', error: error.message})}
})


// endpoint for a organization to reset their password
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

        // Fetch organization using only valid conditions
        let organization = await Organization.findOne({ $or: conditions }).lean()

        if (!organization) {
            return res.status(400).send({ status: 'error', msg: 'No account found with the provided email or phone' });
        }
        */

        // Fetch organization's email
        let organization = await Organization.findOne({ email }).lean()

        if (!organization) {
            return res.status(400).send({ status: 'error', msg: 'No account found with the provided email' });
        }

        // Create reset token (expires in 10 min)
        const resetToken = jwt.sign(
            { _id: organization._id },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        // Send email (or SMS later if implemented)
        await sendPasswordReset(organization.email /*|| organization.phone_no*/, organization.name_of_organization, resetToken)

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
          
              <form action="http://localhost:1000/guest_auth/reset_password" method="post">
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

      console.log("Resetting password for organization ID:", data._id)

  
      // update the phone_no field
      await Organization.updateOne(
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

//endpoint to delete account
router.post('/delete', authToken, async(req, res) => {
    try {
        //Find the organization and delete the account
        const deleted = await Organization.findByIdAndDelete(req.user._id)

        //Check if the organization exists and was deleted
        if(!deleted)
            return res.status(400).send({status: 'error', msg: 'No Organization found'})

        return res.status(200).send({status: 'ok', msg: 'success'})

    } catch (error) {
        console.log(error)

        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})    
    }

})

module.exports = router