const mongoose = require('mongoose')

const savedTrainingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    training_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Training', required: true }
}, {timestamps: true, collection: 'saved_trainings'})

const model = mongoose.model('SavedTraining', savedTrainingSchema)
module.exports = model