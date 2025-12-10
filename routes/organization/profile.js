const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken') // your middleware
const Organization = require('../../models/organization')
const OrganizationProfile = require('../../models/organize_profile')
const UserProfile = require('../../models/user_profile')

const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')
const bcrypt = require('bcryptjs')



// endpoint to view profile
router.post('/view', authToken, async (req, res) => {
    try {
        const org = await Organization.findById(req.user._id).select('-password -twoFAPin') // hide sensitive info
        if (!org)
            return res.status(200).send({ status: 'ok', msg: 'Organization not found' })

        const profile = await UserProfile.findOne({ organization_id: org._id })
        if (!profile) {
            return res.status(200).send({ status: 'ok', msg: 'Profile not found', org })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', org, profile })

    } catch (error) {
        console.log(error)
        if (error.name == "JsonWebTokenError")
            return res.status(400).send({ status: 'error', msg: 'Invalid token' })

        return res.status(500).send({ status: 'error', msg: 'Error occured' })
    }
})


// endpoint to edit organization profile
router.post('/edit', uploader.single('profile_img'), authToken, async (req, res) => {
    try {
        const { company_name, company_reg_no, industry, custom_industry, email, phone_no, company_bio, company_location, credentials,
            services, specialization, clientele, job_listings, profile_img_url, profile_img_id
        } = req.body

        const orgId = req.user._id

        const org = await Organization.findById(orgId)
        if (!org) return res.status(404).send({ status: 'error', msg: 'Organization not found' })

        // Validate Industry
        if (industry === 'Others' && !custom_industry) {
            return res.status(400).send({ status: 'error', msg: 'Please specify your industry' })
        }

        // ==== PROFILE IMAGE HANDLING ====
        let final_img_id = org.profile_img_id
        let final_img_url = org.profile_img_url

        if (req.file) {
            if (org.profile_img_id) await cloudinary.uploader.destroy(org.profile_img_id)

            const upload = await cloudinary.uploader.upload(req.file.path, {
                folder: "profile_images"
            });

            final_img_id = upload.public_id
            final_img_url = upload.secure_url
        } else if (profile_img_url) {
            final_img_id = profile_img_id || org.profile_img_id
            final_img_url = profile_img_url
        }

        // ==== UPDATE ORGANIZATION FIELDS ====
        const orgUpdate = {}
        if (company_name) orgUpdate.company_name = company_name
        if (company_reg_no) orgUpdate.company_reg_no = company_reg_no

        if (industry) {
            orgUpdate.industry = industry
            orgUpdate.custom_industry = industry === 'Others' ? custom_industry : null
        }

        if (email) orgUpdate.email = email
        if (phone_no) orgUpdate.phone_no = phone_no

        org.profile_img_id = final_img_id
        org.profile_img_url = final_img_url

        await org.save()
        const updatedOrg = await Organization.findByIdAndUpdate(orgId, orgUpdate, { new: true })

        // ==== UPDATE ORGANIZATION PROFILE ====
        let profile = await OrganizationProfile.findOne({ organization_id: orgId })
        if (!profile) profile = new OrganizationProfile({ organization_id: orgId })

        if (company_bio) {
            profile.company_bio = { ...profile.company_bio.toObject(), ...company_bio }

            // Sync industry to Organization model if updated inside company_bio
            if (company_bio.industry) {
                org.industry = company_bio.industry
                org.custom_industry = company_bio.industry === 'Others' ? custom_industry : null
                await org.save()
            }
        }

        if (company_location) profile.company_location = company_location
        if (credentials) profile.credentials = credentials
        if (services) profile.services = services
        if (specialization) profile.specialization = specialization
        if (clientele) profile.clientele = clientele
        if (job_listings) profile.job_listings = job_listings

        await profile.save()

        return res.status(200).send({ status: 'ok', msg: 'success', updatedOrg, profile })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})


// endpoint to upload media photos
router.post('/upload_photos', authToken, uploader.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ status: 'error', msg: 'No file uploaded' })

        const upload = await cloudinary.uploader.upload(req.file.path, {
            folder: "media/photos"
        })

        let profile = await OrganizationProfile.findOne({ organization_id: req.user._id });

        if (!profile) {
            profile = new OrganizationProfile({ organization_id: req.user._id })
        }

        // Ensure media array exists and has at least one element
        if (!profile.media || profile.media.length === 0) {
            profile.media = [{ photos: [], videos: [], awards: [] }]
        }

        profile.media[0].photos.push({
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

        let profile = await OrganizationProfile.findOne({ organization_id: req.user._id })

        if (!profile) {
            profile = new OrganizationProfile({ organization_id: req.user._id })
        }

        // Ensure media array exists and has at least one element
        if (!profile.media || profile.media.length === 0) {
            profile.media = [{ photos: [], videos: [], awards: [] }]
        }

        profile.media[0].videos.push({
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
router.post('/upload_awards', authToken, uploader.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ status: 'error', msg: 'No file uploaded' })

        const upload = await cloudinary.uploader.upload(req.file.path, {
            folder: "media/awards"
        })

        let profile = await OrganizationProfile.findOne({ organization_id: req.user._id })

        if (!profile) {
            profile = new OrganizationProfile({ organization_id: req.user._id })
        }

        // Ensure media array exists and has at least one element
        if (!profile.media || profile.media.length === 0) {
            profile.media = [{ photos: [], videos: [], awards: [] }]
        }

        profile.media[0].awards.push({
            file_url: upload.secure_url,
            file_id: upload.public_id
        })

        await profile.save()

        return res.status(200).send({ status: 'ok', msg: 'Award uploaded', file: upload })
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

        const profile = await OrganizationProfile.findOne({ organization_id: req.user._id })

        if (!profile) {
            return res.status(404).send({ status: 'error', msg: 'Organization profile not found' })
        }

        if (!profile.media || profile.media.length === 0) {
            return res.status(404).send({ status: 'error', msg: 'No media found' })
        }

        let list = null

        if (type === "photo") list = profile.media[0].photos
        if (type === "video") list = profile.media[0].videos
        if (type === "award") list = profile.media[0].awards

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
        // 1. Get organization profile by user ID from token
        const profile = await OrganizationProfile.findOne({ organization_id: req.user._id })
            .select('media') // Only return the media field for speed

        // If profile not found
        if (!profile) {
            return res.status(404).send({ status: 'error', msg: 'Organization profile not found' })
        }

        // 2. Return all media items
        return res.status(200).send({ status: 'ok', msg: 'success', media: profile.media })

    } catch (error) {
        return res.status(500).send({ status: 'error', msg: error.message })
    }
})


// endpoint to set up 2FA Pin
router.post('/setup_pin', authToken, async (req, res) => {
    const { twoFAPin, confirm_twoFAPin } = req.body

    //check if fields are passed correctly
    if (!twoFAPin || !confirm_twoFAPin || twoFAPin.length !== 6 || confirm_twoFAPin.length !== 6) {
        return res.status(400).send({ status: 'error', msg: 'Both 2FA Pin and Confirm 2FA Pin must be 6 digits' })
    }

    if (twoFAPin !== confirm_twoFAPin) {
        return res.status(400).send({ status: 'error', msg: '2FA Pin mismatch' })
    }

    // get organization document
    try {
        const org = await Organization.findById(req.user._id)

        if (!org) {
            return res.status(400).send({ status: 'error', msg: 'Organization not found' })
        }

        if (org.twoFAPin) {
            return res.status(400).send({ status: 'error', msg: '2FA Pin already set' })
        }

        const hashedPin = await bcrypt.hash(twoFAPin, 10)
        org.twoFAPin = hashedPin
        await org.save()

        return res.status(200).send({ status: 'ok', msg: 'success' })
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.log(error)
            return res.status(401).send({ status: 'error', msg: 'Token Verification Failed', error: error.message })
        }
        return res.status(500).send({ status: 'error', msg: 'An error occured', error: error.message })
    }
})


// edit 2FA Pin
router.post('/edit_pin', authToken, async (req, res) => {
    const { current_twoFAPin, new_twoFAPin, confirm_new_twoFAPin } = req.body

    //check if fields are passed correctly
    if (!current_twoFAPin || !new_twoFAPin || !confirm_new_twoFAPin || new_twoFAPin.length !== 6 ||
        confirm_new_twoFAPin.length !== 6) {
        return res.status(400).send({ status: 'error', msg: 'Both 2FA Pin and Confirm 2FA Pin must be 6 digits' })
    }

    if (new_twoFAPin !== confirm_new_twoFAPin) {
        return res.status(400).send({ status: 'error', msg: 'Pin mismatch' })
    }

    // get organization document
    try {
        const org = await Organization.findById(req.user._id)

        if (!org) {
            return res.status(400).send({ status: 'error', msg: 'Organization not found' })
        }

        if (!org.twoFAPin) {
            return res.status(400).send({ status: 'error', msg: '2FA Pin not set' })
        }

        const isMatch = await bcrypt.compare(current_twoFAPin, org.twoFAPin)
        if (!isMatch) {
            return res.status(400).send({ status: 'error', msg: 'Current 2FA Pin is incorrect' })
        }

        const hashedNewPin = await bcrypt.hash(new_twoFAPin, 10)
        org.twoFAPin = hashedNewPin
        await org.save()

        return res.status(200).send({ status: 'ok', msg: 'success' })
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.log(error)
            return res.status(401).send({ status: 'error', msg: 'Token Verification Failed', error: error.message })
        }
        return res.status(500).send({ status: 'error', msg: 'An error occured', error: error.message })
    }
})


// Switch to User Profile
router.post('/switch', authToken, async (req, res) => {
    const { password, twoFAPin } = req.body

    if (!password || !twoFAPin) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required' })
    }

    try {
        const org = await Organization.findById(req.user._id)

        if (!org) {
            return res.status(404).send({ status: 'error', msg: 'User not found' })
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, org.password)
        if (!isPasswordValid) {
            return res.status(401).send({ status: 'error', msg: 'Incorrect password' })
        }

        // Check if 2FA PIN exists and matches and matches
        if (!org.twoFAPin) {
            return res.status(400).send({ status: 'error', msg: 'Set up 2FA PIN first' })
        }

        if (org.twoFAPin !== twoFAPin) {
            return res.status(401).send({ status: 'error', msg: 'Incorrect 2FA PIN' })
        }

        // Check if user profile already exists
        let userProfile = await UserProfile.findOne({ owner_user_id: org._id })

        if (userProfile) {
            // Create user Profile if none exists
            userProfile = new UserProfile({
                owner_user_id: org._id,
                firstname: '',
                lastname: '',
                industry: '',
                email: org.email,
                phone_no: org.phone_no
            })
            await userProfile.save()
        }

        // send response with user profile data
        return res.status(200).send({ status: 'ok', msg: 'success', activeProfile: 'User', userProfile })
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.log(error)
            return res.status(401).send({ status: 'error', msg: 'Token Verification Failed', error: error.message })
        }
        return res.status(500).send({ status: 'error', msg: 'An error occured', error: error.message })
    }
})

/*
// endpoint to change password
router.post('/change_password', authToken, async(req, res)=>{
    const {old_password, new_password, confirm_new_password} = req.body

    //check if fields are passed correctly
    if(!old_password || !new_password || !confirm_new_password) {
       return res.status(400).send({status: 'error', msg: 'all fields must be filled'})
    }

    // get organzation document and change password
    try {
        const org =  await Organization.findById(req.user._id).select("password")

        if (!org) {
            return res.status(400).send({status:'error', msg:'Organization not found'})
        }

        //Compare old password
        const check = await bcrypt.compare(old_password, org.password)
        if(!check){
            return res.status(400).send({status:'error', msg:'old password is incorrect'})
        }

        //Prevent reusing old password
        const isSamePassword = await bcrypt.compare(new_password, org.password)
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
*/


// Toggle notifications for organization
router.post('/toggle', authToken, async (req, res) => {
    try {
        const orgId = req.user._id
        const org = await Organization.findById(orgId)

        if (!org) {
            return res.status(404).send({ status: 'error', msg: 'Organization not found' })
        }

        // Toggle the value
        org.notificationsEnabled = !org.notificationsEnabled

        await org.save()

        res.status(200).send({ status: 'ok', msg: 'success', notificationsEnabled: org.notificationsEnabled })
    } catch (error) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})

module.exports = router