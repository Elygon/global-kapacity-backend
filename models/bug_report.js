const mongoose = require('mongoose')

const bugReportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: String,
    phone_no: String,
    message: String,
}, {timestamps: true, collection: 'bug_reports'})

const model = mongoose.model('BugReport', bugReportSchema)
module.exports = model