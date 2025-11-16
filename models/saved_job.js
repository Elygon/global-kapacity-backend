const mongoose = require('mongoose')

const savedJobSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }
}, {timestamps: true, collection: 'saved_jobs'})

const model = mongoose.model('SavedJob', savedJobSchema)
module.exports = model