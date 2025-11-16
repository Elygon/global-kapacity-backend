const mongoose = require("mongoose")

const testimonialSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    organization_id: {type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true},
    comment: {type: String, required: true},
    rating: {type: Number, min: 1, max: 5},
    timestamp: Number
}, { collection: 'testimonials' })

const model = mongoose.model('Testimonial', testimonialSchema)
module.exports = model