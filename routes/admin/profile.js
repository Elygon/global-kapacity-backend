const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Admin = require('../../models/admin')

const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')



// Edit Staff Profile
router.post('/edit', uploader.single('profile_img'), authToken, async (req, res) => {
    const { firstname, lastname, email, phone_no, address, gender, profile_img_url, profile_img_id } = req.body

    try {
        let admin = await Admin.findById(req.user._id, {
            firstname: 1,
            lastname: 1,
            email: 1,
            phone_no: 1,
            address: 1,
            gender: 1,
            profile_img_id: 1,
            profile_img_url: 1
        })

        if (!admin)
            return res.status(404).send({ status: 'error', msg: 'Admin not found' })

        // Default existing image data
        let final_img_id = admin.profile_img_id
        let final_img_url = admin.profile_img_url

        // === Option 1: If new file uploaded ===
        if (req.file) {
            // Delete previous image if exists
            if (admin.profile_img_id) {
                await cloudinary.uploader.destroy(admin.profile_img_id);
            }

            // Upload new image
            const upload = await cloudinary.uploader.upload(req.file.path, {
                folder: "admin-images"
            })

            final_img_id = upload.public_id
            final_img_url = upload.secure_url
        }

        // === Option 2: If image info passed directly in body ===
        else if (profile_img_url) {
            // If both id and url passed, use both
            final_img_id = profile_img_id || admin.profile_img_id
            final_img_url = profile_img_url
        }

        // === Update admin info ===
        admin = await  Admin.findByIdAndUpdate(admin._id,
            {
                firstname: firstname || admin.firstname,
                lastname: lastname || admin.lastname,
                email: email || admin.email,
                phone_no: phone_no || admin.phone_no,
                address: address || admin.address,
                gender: gender || admin.gender,
                profile_img_id: final_img_id,
                profile_img_url: final_img_url
            },
            { new: true }
        ).lean()

        return res.status(200).send({ status: 'ok', msg: 'success', admin })

    } catch (error) {
        console.error(error)

        if (error.name === "JsonWebTokenError")
            return res.status(400).send({ status: 'error', msg: 'Invalid token' })

        return res.status(500).send({status: 'error', msg: 'Error occurred', error: error.message
        })
    }
})


// View Admin Profile
router.post('/view', authToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id).lean()
        if (!admin)
            return res.status(404).send({ status: 'error', msg: 'Admin not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', admin })

    } catch (error) {
        console.error(error)
        if (error.name === "JsonWebTokenError")
            return res.status(400).send({ status: 'error', msg: 'Invalid token' })

        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: error.message })
    }
})

module.exports = router