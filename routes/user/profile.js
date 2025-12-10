const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken') // your middleware
const User = require('../../models/user')
const Organization = require('../../models/organization')
const UserProfile = require('../../models/user_profile')

const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')



// endpoint to view profile
router.post('/view', authToken, async(req, res) =>{
    try {
        const user = await User.findById(req.user._id).select('-password -twoFAPin') // hide sensitive info
        if(!user)
            return res.status(200).send({status: 'ok', msg: 'User not found'})

        const profile = await UserProfile.findOne({ user_id: user._id })
        if (!profile) {
            return res.status(200).send({ status: 'ok', msg: 'Profile not found', user })
        }

        return res.status(200).send({status: 'ok', msg: 'success', user, profile})
        
    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'Error occured'})
    }
})


// endpoint to edit user profile
router.post('/edit', uploader.single('profile_img'), authToken, async (req, res) => {
    try {
        const { firstname, lastname, email, phone_no, gender, date_of_birth, address,professional_bio, school,
            organization, certifications, skills, professional_membership, others, mentors, profile_img_url,
            profile_img_id
        } = req.body

        const userId = req.user._id

        const user = await User.findById(userId)
        if (!user) return res.status(404).send({ status: 'error', msg: 'User not found' })

        // ==== PROFILE IMAGE HANDLING ====
        let final_img_id = user.profile_img_id
        let final_img_url = user.profile_img_url

        // If new file uploaded
        if (req.file) {
            if (user.profile_img_id) {
                await cloudinary.uploader.destroy(user.profile_img_id)
            }

            const upload = await cloudinary.uploader.upload(req.file.path, {
                folder: "profile_images"
            });

            final_img_id = upload.public_id
            final_img_url = upload.secure_url
        }

        // If frontend provided direct URL
        else if (profile_img_url) {
            final_img_id = profile_img_id || user.profile_img_id
            final_img_url = profile_img_url
        }

        // ==== UPDATE USER FIELDS ====
        const userUpdate = {};
        if (firstname) userUpdate.firstname = firstname
        if (lastname) userUpdate.lastname = lastname
        if (email) userUpdate.email = email
        if (phone_no) userUpdate.phone_no = phone_no

        user.profile_img_id = final_img_id
        user.profile_img_url = final_img_url

        await user.save()
        const updatedUser = await User.findByIdAndUpdate(userId, userUpdate, { new: true })

        // ==== UPDATE USER PROFILE ====
        let profile = await UserProfile.findOne({ user_id: userId })
        if (!profile) profile = new UserProfile({ user_id: userId })

        if (gender) profile.gender = gender
        if (date_of_birth) profile.date_of_birth = date_of_birth
        if (address) profile.address = address
        if (professional_bio) profile.professional_bio = professional_bio
        if (school) profile.school = school
        if (organization) profile.organization = organization
        if (certifications) profile.certifications = certifications
        if (skills) profile.skills = skills
        if (professional_membership) profile.professional_membership = professional_membership
        if (others) profile.others = others
        if (mentors) profile.mentors = mentors

        await profile.save()

        return res.status(200).send({ status: 'ok', msg: 'success', user: updatedUser, profile })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message})
    }
})

// endpoint to upload media photos
router.post('/upload_photos', authToken, uploader.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ status: 'error', msg: 'No file uploaded' })

        const upload = await cloudinary.uploader.upload(req.file.path, {
            folder: "media/photos"
        })

        const profile = await UserProfile.findOne({ user_id: req.user._id });
        profile.media.photos.push({
            file_url: upload.secure_url,
            file_id: upload.public_id
        })

        await profile.save()

        return res.status(200).send({ status: 'ok', msg: 'success', file: upload })
    } catch (error) {
        return res.status(500).send({ status: 'error', msg: error.message })
    }
})


// endpoint to upload media videos
router.post('/upload_videos', authToken, uploader.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ status: 'error', msg: 'No file uploaded' })

        const upload = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "video",
            folder: "media/videos"
        })

        const profile = await UserProfile.findOne({ user_id: req.user._id })
        profile.media.videos.push({
            file_url: upload.secure_url,
            file_id: upload.public_id
        })

        await profile.save()

        return res.status(200).send({ status: 'ok', msg: 'success', file: upload })
    } catch (error) {
        return res.status(500).send({ status: 'error', msg: error.message })
    }
})


// endpoint to upload media awards
router.post('/upload_award', authToken, uploader.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ status: 'error', msg: 'No file uploaded' })

        const upload = await cloudinary.uploader.upload(req.file.path, {
            folder: "media/awards"
        })

        const profile = await UserProfile.findOne({ user_id: req.user._id })
        profile.media.awards.push({
            file_url: upload.secure_url,
            file_id: upload.public_id
        })

        await profile.save()

        return res.status(200).send({ status: 'ok', msg: 'success', file: upload })
    } catch (error) {
        return res.status(500).send({ status: 'error', msg: error.message })
    }
})


// endpoint to delete any media files( photos, videos or awards)
router.post('/delete_media', authToken, async (req, res) => {
    try {
        const { file_id, type } = req.body
        // type = "photo" | "video" | "award"

        if (!file_id || !type)
            return res.status(400).send({ status: 'error', msg: 'all fields are required' })

        const profile = await UserProfile.findOne({ user_id: req.user._id })

        let list = null

        if (type === "photo") list = profile.media.photos
        if (type === "video") list = profile.media.videos
        if (type === "award") list = profile.media.awards

        const index = list.findIndex(item => item.file_id === file_id)
        if (index === -1) return res.status(404).send({ status: 'error', msg: 'File not found' })

        // delete from cloudinary
        await cloudinary.uploader.destroy(file_id)

        // remove from array
        list.splice(index, 1)

        await profile.save()

        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (error) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})


// endpoint to fetch all media
router.post('/all_media', authToken, async (req, res) => {
    try {
        // 1. Get user profile by user ID from token
        const profile = await UserProfile.findOne({ user_id: req.user._id })
            .select('media') // Only return the media field for speed

        // If profile not found
        if (!profile) {
            return res.status(404).send({ status: 'error', msg: 'User profile not found' })
        }

        // 2. Return all media items
        return res.status(200).send({ status: 'ok', msg: 'success', media: profile.media })

    } catch (error) {
        return res.status(500).send({ status: 'error', msg: error.message })
    }
})

// endpoint to set up 2FA Pin
router.post('/setup_pin', authToken, async(req, res)=>{
    const {twoFAPin, confirm_twoFAPin} = req.body

    //check if fields are passed correctly
    if(!twoFAPin || !confirm_twoFAPin || twoFAPin.length !== 6 || confirm_twoFAPin !== 6) {
       return res.status(400).send({status: 'error', msg: 'Both 2FA Pin and Confirm 2FA Pin must be 6 digits'})
    }

    if ( twoFAPin !== confirm_twoFAPin) {
        return res.status(400).send({status: 'error', msg: '2FA Pin mismatch'})
    }

    // get user document
    try {
        const user =  await User.findById(req.user._id)

        if (!user) {
            return res.status(400).send({status:'error', msg:'User not found'})
        }

        if (user.twoFAPin) {
            return res.status(400).send({ status: 'error', msg: '2FA Pin already set'})
        }

        const hashedPin = await bcrypt.hash(pin, 10)
        user.twoFAPin = hashedPin
        await user.save()

        return res.status(200).send({status: 'ok', msg: 'success'})
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
        console.log(error)
        return res.status(401).send({status: 'error', msg: 'Token Verification Failed', error: error.message})
}
      return res.status(500).send({status: 'error', msg: 'An error occured', error: error.message})}
})


// edit 2FA Pin
router.post('/edit_pin', authToken, async(req, res)=>{
    const {current_twoFAPin, new_twoFAPin, confirm_new_twoFAPin} = req.body

    //check if fields are passed correctly
    if(!current_twoFAPin || !new_twoFAPin || !confirm_new_twoFAPin || new_twoFAPin.length !== 6 || 
        confirm_new_twoFAPin !== 6) {
            return res.status(400).send({status: 'error', msg: 'Both 2FA Pin and Confirm 2FA Pin must be 6 digits'})
        }

    if ( new_twoFAPin !== confirm_new_twoFAPin) {
        return res.status(400).send({status: 'error', msg: 'Pin mismatch'})
    }

    // get user document
    try {
        const user =  await User.findById(req.user._id)

        if (!user) {
            return res.status(400).send({status:'error', msg:'User not found'})
        }

        if (user.twoFAPin) {
            return res.status(400).send({ status: 'error', msg: '2FA Pin not set'})
        }

        const isMatch = await bcrypt.compare(current_twoFAPin, user.twoFAPin)
        if (!isMatch) {
            return res.status(400).send({ status: 'error', msg: 'Current 2FA Pin is incorrect'})
        }

        const hashedNewPin = await bcrypt.hash(pin, 10)
        user.twoFAPin = hashedNewPin
        await user.save()

        return res.status(200).send({status: 'ok', msg: 'success'})
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
        console.log(error)
        return res.status(401).send({status: 'error', msg: 'Token Verification Failed', error: error.message})
}
      return res.status(500).send({status: 'error', msg: 'An error occured', error: error.message})}
})


// Switch to Organization Profile
router.post('/switch', authToken, async(req, res)=>{
    const { password, twoFAPin} = req.body

    if(!password || !twoFAPin) {
        return res.status(400).send({status: 'error', msg: 'All fields are required'})
    }

    try {
        const user =  await User.findById(req.user._id)

        if (!user) {
            return res.status(404).send({status:'error', msg:'User not found'})
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).send({ status: 'error', msg: 'Incorrect password'})
        }

        // Check if 2FA PIN exists and matches and matches
        if (!user.twoFAPin) {
            return res.status(400).send({ status: 'error', msg: 'Set up 2FA PIN first'})
        }

        if (user.twoFAPin !== twoFAPin) {
            return res.status(401).send({ status: 'error', msg: 'Incorrect 2FA PIN'})
        }

        // Check if organization profile already exists
        let orgProfile = await Organization.findOne({ owner_user_id: user._id })

        if (orgProfile) {
            // Create organization Profile if none exists
            orgProfile = new Organization({
                owner_user_id: user._id,
                name_of_organization: '',
                company_reg_no: '',
                industry: '',
                email: user.email,
                phone_no: user.phone_no
            })
            await orgProfile.save()
        }

        // send response with organization profile data
        return res.status(200).send({status: 'ok', msg: 'success', activeProfile: 'Organization', orgProfile})
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
        console.log(error)
        return res.status(401).send({status: 'error', msg: 'Token Verification Failed', error: error.message})
}
      return res.status(500).send({status: 'error', msg: 'An error occured', error: error.message})}
})

/*
// endpoint to change password
router.post('/change_password', authToken, async(req, res)=>{
    const {old_password, new_password, confirm_new_password} = req.body

    //check if fields are passed correctly
    if(!old_password || !new_password || !confirm_new_password) {
       return res.status(400).send({status: 'error', msg: 'all fields must be filled'})
    }

    // get user document and change password
    try {
        const user =  await User.findById(req.user._id).select("password")

        if (!user) {
            return res.status(400).send({status:'error', msg:'User not found'})
        }

        //Compare old password
        const check = await bcrypt.compare(old_password, user.password)
        if(!check){
            return res.status(400).send({status:'error', msg:'old password is incorrect'})
        }

        //Prevent reusing old password
        const isSamePassword = await bcrypt.compare(new_password, user.password)
        if(isSamePassword){
            return res.status(400).send({status:'error', msg:'New password must be different from the old password'})
        }

        //Confirm new passwords match
        if (new_password !== confirm_new_password) {
            return res.status(400).send({status: 'error', msg: 'Password mismatch'})
        }

        //Hash new password and update
        const updatePassword = await bcrypt.hash(confirm_new_password, 10)
        await User.findByIdAndUpdate(req.user._id, {password: updatePassword})

        return res.status(200).send({status: 'ok', msg: 'success'})
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
        console.log(error)
        return res.status(401).send({status: 'error', msg: 'Token Verification Failed', error: error.message})
}
      return res.status(500).send({status: 'error', msg: 'An error occured', error: error.message})}
})
*/

// Toggle notifications for user
router.post('/toggle', authToken, async(req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        // Toggle the value
        user.notificationsEnabled = !user.notificationsEnabled

        await user.save()

        res.status(200).send({ status: 'ok', msg: 'success', notificationsEnabled: user.notificationsEnabled })
    } catch (error) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})

module.exports = router