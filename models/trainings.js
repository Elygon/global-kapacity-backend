const mongoose = require('mongoose')

const trainingSchema = new mongoose.Schema({
    user_id: String,
    organization_id: String,
    title: String,
    tags: {
        type: String,
        enum: ['Virtual', 'Free', 'Banking/Fintech', 'Certified Training']
    },
    about_event: String,
    start_date: Date,
    end_date: Date,
    start_time: String,
    end_time: String,
    location_type: {
        type: String,
        enum: [ 'Virtual', 'Physical', 'Hybrid']
    },
    location_detail: String,
    gain: String, // what they'll gain from the event
    speakers: [{
        name: String,
        role: String,
        organization: String,
        image: { img_id: String, img_url: String }
    }],
    organizers: [{
        name: String,
        location: String,
        image: { img_id: String, img_url: String }
    }],
    event_type: {
        type: String,
        enum: [
            'Free Virtual Event', 'Paid Event In-Person', 'Paid Event Hybrid'
        ]
    },
    images: [
        { img_id: String, img_url: String }
    ]
}, { timestamps: true, collection: 'trainings' })

const model = mongoose.model('Trainings', trainingSchema)
module.exports = model