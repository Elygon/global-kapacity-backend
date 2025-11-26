const mongoose = require("mongoose")

const testimonialSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: "User", default: null},
    organization_id: {type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null},
    comment: {type: String, required: true},
    rating: {type: Number, min: 1, max: 5},
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
    approved_at: Date,
    approved_by: {type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null},
}, { timestamps: true, collection: 'testimonials' })

const model = mongoose.model('Testimonial', testimonialSchema)
module.exports = model