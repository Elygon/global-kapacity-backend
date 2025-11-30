const express = require('express')
const router = express.Router()

const authToken = require('../../middleware/authToken')
const Training = require('../../models/training')
const SavedTraining = require("../../models/saved_traaining")
const { isPremiumUser } = require("../../middleware/opportunityPost")
const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')
const { getDateFromPeriod } = require("../../functions/dateGetter")
const { preventFreemiumDetailView } = require("../../middleware/freemiumlimit")



// ==========================
// 1. Browse all trainings
// ==========================
router.post("/browse", authToken, async (req, res) => {
    try {
        const trainings = await Training.find().sort({ createdAt: -1 })
        res.status(200).send({ status: "ok", msg: 'success', trainings })
    } catch (error) {
        res.status(500).send({ status: "error", message: "Server error", error: error.message })
    }
})


/*/ ==========================
// 2. Search / Filter scholarships
// =======================
router.post("/search", authToken, async (req, res) => {
    try {
        const {
            keyword,        // search by name or university
            field_of_study,
            scholarship_type,
            region,
            gender_based,
            date_posted,     // all, last_24_hours, last_3_days, last_7_days, last_14_days, last_30_days, over_1_month
            mode_of_study
        } = req.body

        const filter = {}

        // Keyword search on name or university
        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { university: { $regex: keyword, $options: "i" } }
            ]
        }

        // Filters
        if (field_of_study) filter.field_of_study = field_of_study
        if (scholarship_type) filter.scholarship_type = scholarship_type
        if (region) filter.region = region
        if (gender_based) filter.gender_based = gender_based
        if (mode_of_study) filter.mode_of_study = mode_of_study

        // Date posted filter
        if (date_posted && date_posted !== "all") {
            const dateLimit = getDateFromPeriod(date_posted)
            if (dateLimit === "over_1_month") {
                // scholarships older than 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                filter.createdAt = { $lt: thirtyDaysAgo }
            } else if (dateLimit) {
                filter.createdAt = { $gte: dateLimit }
            }
        }

        const scholarships = await Scholarship.find(filter).sort({ createdAt: -1 })

        res.status(200).send({ status: "ok", msg: "success", scholarships })

    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})
*/

// ==========================
// 3. View single training
// ==========================
router.post("/single",  authToken, preventFreemiumDetailView, async (req, res) => {
    try {
        const { trainingId } = req.body

        const training = await Training.findById(trainingId)
        if (!training) return res.status(404).send({ status: "error", msg: "Training not found" })

        res.status(200).send({ status: "ok", msg: "success", training })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 4. Save a training
// ==========================
router.post("/save", authToken, async (req, res) => {
    try {
        const { trainingId } = req.body
        const userId = req.user._id

        // Check if already saved
        const existing = await SavedTraining.findOne({ userId, trainingId })
        if (existing) {
            return res.status(400).send({ status: "error", msg: "Training already saved" })
        }

        const saved = new SavedTraining({ userId, trainingId })
        await saved.save()

        res.status(200).send({ status: "ok", msg: "success", saved })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 5. Unsave a training
// ==========================
router.post("/unsave", authToken, async (req, res) => {
    try {
        const { trainingId } = req.body // the job to unsave
        const userId = req.user._id

        if (!trainingId) {
            return res.status(400).send({ status: 'error', msg: 'Training ID is required' })
        }

        // Remove the training from the user's saved trainings array
        const updatedUser = await User.findByIdAndUpdate( userId, 
            { $pull: { savedTrainings: trainingId }}, // assumes saved trainings is an array of ObjectIds
            { new: true }
        )

        return res.status(200).send({ status: "ok", msg: "success", savedTrainings: updatedUser.savedTrainings })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// 6. List of saved trainings
// ==========================
router.post("/saved", authToken, async (req, res) => {
    try {
        const userId = req.user._id
        const savedTrainings = await SavedTraining.find({ userId }).populate("trainingId").sort({ createdAt: -1 })

        if (!savedTrainings.length) {
            return res.status(200).send({ status: 'ok', msg: 'You haven\'t saved any training yet', count: 0 })
        }

        res.status(200).send({ status: "ok", msg: "success", count: savedTrainings.length, savedTrainings })
    } catch (error) {
        res.status(500).send({ status: "error", msg: "Server error", error: error.message })
    }
})


// ==========================
// PRE-STEP 1: INDIVIDUAL SELECT KIP
// ==========================
router.post("/select_kip", authToken, isPremiumUser, async (req, res) => {
    const { selected_kip } = req.body

    if ( !selected_kip ) {
        return res.status(400).send({ status: 'error', send: 'You must select a Kapacity Impact Partner'})
    }
    
    try {
        // Save a 'draft' training tied to the individual with selected KIP
        const newTraining = new Training({
            posted_by: req.user._id,
            posted_by_model: 'User',
            selected_kip,
            selected_kip_model: 'User', // or 'Organization' depending on KIP type
            kip_response: 'pending',
            status: 'draft', // pre-step draft
            step: 0 // indicates before Step 1
        })

        await newTraining.save()
        res.status(201).send({ status: 'ok', msg: "success", newTraining })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// STEP 1: POST A TRAINING (USER)
// ==========================
router.post("/step_one", authToken, isPremiumUser, uploader.array('images', 5), async (req, res) => {
    const { title, industry, training_type, training_mode, address, date, time, reg_deadline, is_certified } = req.body

    if ( !title || !industry || !training_type || !training_mode || !address || !date || !time
        || !reg_deadline || !is_certified ) {
        return res.status(400).send({ status: 'error', send: 'All fields are required'})
    }
    
    try {
        let images = []

        // Handle uploaded files first
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Upload main image
                const upload = await cloudinary.uploader.upload(file.path,
                    { folder: "banner-images" }
                )

                // Upload thumbnail
                const thumb = await cloudinary.uploader.upload(file.path, {
                    folder: 'banner-images-thumbs',
                    crop: 'fill',
                    width: 200,
                    height: 200,
                    quality: 'auto'
                })

                images.push({ img_id: upload.public_id, img_url: upload.secure_url, 
                    thumb_id: thumb.public_id, thumb_url: thumb.secure_url }
                )
            }
        }

        // Handle JSON images sent in the request body
        let bodyImages = []
        if (req.body.images) {
            try {
                // If images are sent as JSON string, parse it
                bodyImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images
            } catch (err) {
                return res.status(400).send({ status: "error", msg: "Invalid format for images", error: err.message })
            }

            if (Array.isArray(bodyImages) && bodyImages.length > 0) {
                for (const img of bodyImages) {
                    if (img.img_id && img.img_url) {
                        images.push({ img_id: img.img_id, img_url: img.img_url })
                    }
                }
            }
        }

        const newTraining = new Training({
            posted_by: req.user._id, // This references the user/org creating the training
            posted_by_model: 'User',
            title,
            industry,
            training_type,
            training_mode,
            address,
            date,
            time,
            reg_deadline,
            is_certified,
            banner_img: images,
            step: 1,
            status: 'draft'
        })

        await newTraining.save()
        res.status(201).send({ status: 'ok', msg: "success", newTraining })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// STEP 2: POST A TRAINING
// ==========================
router.post("/step_two", authToken, isPremiumUser, async (req, res) => {
    const { trainingId, about, gain, attendee, trainers, co_organizers } = req.body
    if (!trainingId || !about || !gain || !attendee || !trainers || !co_organizers ) {
        return res.status(404).send({ status: 'error', msg: "All fields are required" })
    }
    
    try {
        const training = await Training.findById(trainingId)

        if (!training) {
            return res.status(404).send({ status: 'error', msg: "Training not found." })
        }

        // Update step 2 details
        training.about = about
        training.gain = gain
        training.attendee = attendee
        training.trainers = Array.isArray(trainers) ? trainers : [trainers]
        training.co_organizers = Array.isArray(co_organizers) ? co_organizers : [co_organizers]
        /*if (Array.isArray(co_organizers)) {
            training.co_organizers = co_organizers
        }*/
        training.step = 2

        await training.save()
        res.status(200).send({ status: 'ok', msg: "success", training })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})



// ==========================
// STEP 3: POST A TRAINING + KIP
// ==========================
router.post("/step_three", authToken, isPremiumUser, async (req, res) => {
    const { trainingId, is_paid, has_tickets, tickets, training_fee, training_link, preferred_reg_method,
        external_reg_url, msg_after_reg} = req.body
    if (!trainingId || is_paid == null || has_tickets == null || !msg_after_reg) {
        return res.status(404).send({ status: 'error', msg: "All fields are required" })
    }
    
    try {
        // Validate preferred registration method
        const validMethods = ['kapacity', 'external']
        if (preferred_reg_method && !validMethods.includes(preferred_reg_method)) {
            return res.status(400).send({ status: 'error', msg: 'Invalid preferred registration method' })
        }
        
        // Build step 3 object
        const step3Data = {
            reg: {is_paid: is_paid, has_tickets: has_tickets},
            tickets: has_tickets ? tickets : [], // Only save tickets if has_tickets = true
            training_fee: !has_tickets ? training_fee : null, // Only valid for non-ticket option
            training_link: training_link || null,
            preferred_reg_method: preferred_reg_method,
            external_reg_url: preferred_reg_method === 'external' ? external_reg_url: null,
            msg_after_reg: msg_after_reg
        }
        const updatedTraining = await Training.findByIdAndUpdate(
            { _id: trainingId, posted_by: req.user._id, posted_by_model: 'User' }, 
            { $set: { ...step3Data, step: 3, updatedAt: Date.now() }}, { new: true })

        if (!updatedTraining) {
            return res.status(404).send({ status: 'error', msg: "Training not found." })
        }

        res.status(200).send({ status: 'ok', msg: "success", updatedTraining })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})



/*/ =========================================
// STEP 4: TRAINING PREVIEW
// =========================================
router.post('/preview', authToken, isPremiumUser, async (req, res) => {
    const { trainingId } = req.body

    try {
        const training = await Training.findOne({ _id: trainingId , organization: req.user._id })

        if (!training)
            return res.status(404).send({ status: 'ok', msg: 'Training not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', training })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})
*/


// =========================================
// PUBLISH TRAINING
// =========================================
router.post('/publish', authToken, isPremiumUser, async (req, res) => {
    const { trainingId } = req.body
    
    try {
        const training = await Training.findOneAndUpdate({ _id: trainingId, posted_by: req.user._id,
            posted_by_model: 'User'  }, { $set: { is_published: true , updatedAt: Date.now() }}, { new: true }
        )

        if (!training)
            return res.status(404).send({ status: 'error', msg: 'Training not found' })

        if (training.step !== 3)
            return res.status(400).send({ send: 'error', msg: 'Complete all steps before publishing'})

        return res.status(200).send({ status: 'ok', msg: 'success', training })
    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})

// =========================================
// GET ALL TRAININGS POSTED BY THIS USER
// =========================================
router.post('/all', authToken, isPremiumUser, async (req, res) => {
    try {
        const trainings = await Training.find({ posted_by: req.user._id, posted_by_model: 'User' })
        .sort({ date_posted: -1 })

        if (!trainings.length)
            return res.status(200).send({ status: 'ok', msg: 'No training postings found' })

        return res.status(200).send({ status: 'ok', msg: 'success', count: trainings.length, trainings })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// VIEW A SPECIFIC TRAINING
// =========================================
router.post('/view', authToken, isPremiumUser, async (req, res) => {
    const { trainingId } = req.body

    if (!trainingId)
        return res.status(400).send({ status: 'error', msg: 'Training ID is required' })

    try {
        const training = await Training.findOne({ _id: trainingId, posted_by: req.user._id, posted_by_model: 'User'})
        
        if (!training)
            return res.status(404).send({ status: 'error', msg: 'Training not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', training })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// UPDATE A TRAINING INFO
// =========================================
router.post('/update', authToken, isPremiumUser, async (req, res) => {
    const { trainingId, ...updateData } = req.body
    
    if (!trainingId)
        return res.status(400).send({ status: 'error', msg: 'Training ID is required' })

    try {
        const training = await Training.findOne({ _id: trainingId, posted_by: req.user._id, posted_by_model: 'User' })

        if (!training)
            return res.status(404).send({ status: 'error', msg: 'Training not found' })

        updateData.timestamp = Date.now()

        const updatedTraining = await Training.findByIdAndUpdate(trainingId, updateData, { new: true })

        return res.status(200).send({ status: 'ok', msg: 'success', training: updatedTraining })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// CLOSE A TRAINING POSTING
// =========================================
router.post('/close', authToken, isPremiumUser, async (req, res) => {
    const { trainingId } = req.body

    if (!trainingId)
        return res.status(400).send({ status: 'error', msg: 'Training ID is required' })

    try {
        const training = await Training.findOneAndUpdate(
            { _id: trainingId, posted_by: req.user._id, posted_by_model: 'User' }, 
            { $set: { is_closed: true }}, { new: true })

        if (!training)
            return res.status(404).send({ status: 'error', msg: 'Training not found' })

        return res.status(200).send({ status: 'ok', msg: 'success', training })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})



// =========================================
// DELETE TRAINING POSTING
// =========================================
router.post('/delete', authToken, isPremiumUser, async (req, res) => {
    const { trainingId } = req.body

    if (!trainingId)
        return res.status(400).send({ status: 'error', msg: 'Training ID is required' })

    try {
        const deleted = await Training.findOneAndDelete(
            { _id: trainingId, posted_by: req.user._id, posted_by_model: 'User' }
        )

        if (!deleted)
            return res.status(404).send({ status: 'error', msg: 'Training not found or already deleted' })

        

        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (e) {
        if (e.name === 'JsonWebTokenError')
            return res.status(400).send({ status: 'error', msg: 'Invalid token', error: e.message })

        return res.status(500).send({ status: 'error', msg: 'An error occurred', error: e.message })
    }
})


module.exports = router