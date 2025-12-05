const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
dotenv.config()

const bcrypt = require('bcryptjs')
const authToken = require('../../middleware/authToken')
const { sendAdminAccountMail } = require('../../utils/nodemailer')
const Admin = require('../../models/admin')
const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')


// create admin account
router.post('/create_account', authToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'master admin') {
            return res.status(403).send({ status: 'error', msg: 'Access denied. Only Master Admin can create admin accounts.' })
        }

        const { firstname, lastname, email, password, phone_no, role } = req.body

        if (!firstname || !lastname || !email || !password || !phone_no) {
            return res.status(400).send({ status: 'error', msg: 'All fields are required' })
        }

        const existingAdmin = await Admin.findOne({ email })
        if (existingAdmin) {
            return res.status(400).send({ status: 'error', msg: 'Email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newAdmin = new Admin({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            phone_no,
            role
        })

        await newAdmin.save()

        console.log("Sending email to:", email)


        // Send confirmation mail (non-blocking)
        await sendAdminAccountMail(email, password, firstname)

        return res.status(201).send({ status: 'ok',
            msg: 'success',
            data: { id: newAdmin._id, firstname: newAdmin.firstname, lastname: newAdmin.lastname, email: newAdmin.email,
                phone_no: newAdmin.phone_no, role: newAdmin.role }
        })
    } catch (error) {
        console.error('Error creating account:', error)
        return res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Master admin edits admin account
router.post("/edit_account", authToken, uploader.single("profile_img"), async (req, res) => {
    try {
        const { id, ...updateData } = req.body

        if (!id) return res.status(400).send({ status: "error", msg: "Admin ID is required" })
        if (!req.user || req.user.role !== "master admin")
            return res.status(403).send({ status: "error", msg: "Access denied. Only Master Admin can edit accounts" })

        let admin = await Admin.findById(id)
        if (!admin) return res.status(404).send({ status: "error", msg: "Staff not found" })

        // Handle profile image
        if (req.file) {
            if (admin.img_id) await cloudinary.uploader.destroy(admin.img_id)
            const upload = await cloudinary.uploader.upload(req.file.path, { folder: "admin-images" })
            updateData.img_id = upload.public_id
            updateData.img_url = upload.secure_url
        }

        // Whitelist allowed fields for safety
        const allowedFields = ["firstname", 'lastname', "email", "phone_no", "role", "address", "img_id", "img_url"]
        Object.keys(updateData).forEach(key => {
            if (!allowedFields.includes(key)) delete updateData[key]
        })

        updateData.updatedAt = Date.now()

        // Perform update
        admin = await Admin.findByIdAndUpdate(id, updateData, { new: true })

        return res.status(200).send({ status: "ok", msg: "success", admin })
    } catch (error) {
        console.error("Error editing account:", error);
        return res.status(500).send({ status: "error", msg: "An error occurred", error: error.message });
    }
})


// View all admins
router.post('/view_admins', authToken, async (req, res) => {
    try {
        if (!req.user.role || req.user.role.toLowerCase() !== 'master admin') {
            return res.status(403).send({ status: 'error', msg: 'Access denied. Only Master Admin can view admin accounts.' })
        }

        /*const { role } = req.body
        let query = {}

        if (role) {
            const roleFormatted = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
            if (!['Admin', 'Staff'].includes(roleFormatted)) {
                return res.status(400).send({ status: 'error', msg: 'Role must be Admin or Staff' })
            }
            query.role = roleFormatted
        } else {
            query.role = { $in: ['Admin', 'Staff'] } // fetch both Admins & Staffs
        }*/

        // Fetch all Admins
        const admins = await Admin.find({}).select('-password').lean()
        if (admins.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No admins found', admins: [] })
        }

        res.status(200).send({ status: 'ok', msg:'success', count: admins.length, admins })
    } catch (e) {
        console.error(e)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// View specific admin
router.post('/view_admin', authToken, async (req, res) => {
    try {
        if (!req.user.role || req.user.role.toLowerCase() !== 'master admin') {
            return res.status(403).send({ status: 'error', msg: 'Access denied. Only Master Admin can view admin details.' })
        }

        const { id } = req.body
        if (!id ) {
            return res.status(400).send({ status: 'error', msg: 'Admin ID is required' })
        }

        const admin = await Admin.findOne({ _id: id }).select('-password').lean()
        if (!admin) {
            return res.status(404).send({ status: 'error', msg: 'Admin not found' })
        }

        return res.status(200).send({ status: 'ok', msg: 'success', admin })
    } catch (e) {
        console.error(e)
        return res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Delete admin
router.post('/delete_admin', authToken, async (req, res) => {
    try {
        if (req.user.role !== 'master admin') {
            return res.status(403).send({ status: 'error', msg: 'Access denied. Only Master Admin can delete admin account.' })
        }

        const { id } = req.body
        if (!id) {
            return res.status(400).send({ status: 'error', msg: 'Admin ID is required' })
        }

        const deletedAdmin = await Admin.findOneAndDelete({ _id: id })
        if (!deletedAdmin) {
            return res.status(404).send({ status: 'error', msg: 'Admin not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success' })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Block admin
router.post('/block_admin', authToken, async (req, res) => {
    try {
        if (!req.user.role || req.user.role.toLowerCase() !== 'master admin') {
            return res.status(403).send({ status: 'error', msg: 'Access denied. Only Master Admin can block admin account.' })
        }

        const { id } = req.body
        if (!id) {
            return res.status(400).send({ status: 'error', msg: 'Admin ID is required' })
        }

        const blockedAdmin = await Admin.findOneAndUpdate({ _id: id }, { is_blocked: true }, { new: true })
        if (!blockedAdmin) {
            return res.status(404).send({ status: 'error', msg: 'Admin not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', blockedAdmin })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// Unblock admin
router.post('/unblock_admin', authToken, async (req, res) => {
    try {
        if (req.user.role !== 'master admin') {
            return res.status(403).send({ status: 'error', msg: 'Access denied. Only Master Admin can unblock admin account.' })
        }

        const { id } = req.body
        if (!id) {
            return res.status(400).send({ status: 'error', msg: 'Admin ID is required' })
        }

        const unblockedAdmin = await Admin.findOneAndUpdate({ _id: id }, { is_blocked: false }, { new: true }
        )

        if (!unblockedAdmin) {
            return res.status(404).send({ status: 'error', msg: 'Admin not found' })
        }

        res.status(200).send({ status: 'ok', msg: 'success', unblockedAdmin })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})


// View all blocked admins
router.post('/blocked_admins', authToken, async (req, res) => {
    try {
        if (!req.user.role || req.user.role.toLowerCase() !== 'master admin') {
            return res.status(403).send({ status: 'error', msg: 'Access denied. Only Master Admin can view blocked admin accounts.' })
        }

        // Fetch all blocked Admins
        const blockedAdmins = await Admin.find({ is_blocked: true }).select('-password').lean()

        if (blockedAdmins.length === 0) {
            return res.status(200).send({ status: 'ok', msg: 'No blocked admins found', blockedAdmins: [] })
        }

        res.status(200).send({ status: 'ok', msg: 'success', count: blockedAdmins.length, blockedAdmins })
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: 'error', msg: 'Error occurred' })
    }
})

module.exports = router