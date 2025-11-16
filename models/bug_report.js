const mongoose = require('mongoose')

const bugReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    email: String,
    phone_no: String,
    message: String,
}, {timestamps: true, collection: 'bug_reports'})

const model = mongoose.model('BugReport', bugReportSchema)
module.exports = model