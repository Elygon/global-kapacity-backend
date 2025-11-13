const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    user_id: String,
    organization_id: String,
    call_in_progress: {type: Boolean, default: false},
    is_calling:  {type: Boolean, default: false},
    disable_other_incoming_calls: {type: Boolean, default: false},
    designation: String,
    channel_name: String,
    call_token: String,
    // user_call_token: String,
    // organization_call_token: String,
    fullname: String,
    img_url: String
}, {timestamp: true, collection: 'calls'});

const model = mongoose.model('Call', callSchema);
module.exports = model;