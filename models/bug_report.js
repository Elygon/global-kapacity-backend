const mongoose = require('mongoose')

const bugReportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    email: String,
    phone_no: String,
    message: String,
    resolved: { type: Boolean, default: false }
}, { timestamps: true, collection: 'bug_reports' })

const model = mongoose.model('BugReport', bugReportSchema)
module.exports = model