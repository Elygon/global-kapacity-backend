const express = require('express')
const app = express()

const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose')

const cors = require('cors')

// Allow any origin during development
app.use(cors({
    origin: '*', // Allow all origins for now
    credentials: true, // optional, only if frontend sends cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))



// connect database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on('error', (err) => console.error('MongoDB connection error:', err))
db.once('open', () => console.log('Connected to MongoDB'))

app.use(express.json())
app.use(express.urlencoded({extended: true}))


//user routes
app.use('/user_auth', require('./routes/user/auth'))
app.use('/user_profile', require('./routes/user/profile'))
app.use('/user_kip_application', require('./routes/user/kip_application'))
app.use('/user_kip', require('./routes/user/kip'))
app.use('/user_job', require('./routes/user/job'))
app.use('/user_job_application', require('./routes/user/job_application'))
app.use('/user_scholarship', require('./routes/user/scholarship'))
app.use('/user_sch_application', require('./routes/user/sch_application'))
app.use('/user_chat', require('./routes/user/chat'))
app.use('/user_faq', require('./routes/user/faq'))
app.use('/user_testimonial', require('./routes/user/testimonial'))
app.use('/user_customer_support', require('./routes/user/customer_support'))
app.use('/user_bug_report', require('./routes/user/bug_report'))
app.use('/user_subscription', require('./routes/user/subscription'))
app.use('/user_payment', require('./routes/user/payment'))


// search route for both user (individual) and organization
app.use('/search', require('./routes/search/search'))

//organization routes
app.use('/organization_auth', require('./routes/organization/auth'))
app.use('/organization_profile', require('./routes/organization/profile'))
app.use('/organization_kip_application', require('./routes/organization/kip_application'))
app.use('/organization_kip', require('./routes/organization/kip'))
app.use('/organization_job', require('./routes/organization/job'))
app.use('/organization_job_application', require('./routes/organization/job_application'))
app.use('/organization_scholarship', require('./routes/organization/scholarship'))
app.use('/organization_chat', require('./routes/organization/chat'))
app.use('/organization_faq', require('./routes/organization/faq'))
app.use('/organization_testimonial', require('./routes/organization/testimonial'))
app.use('/organization_customer_support', require('./routes/organization/customer_support'))
app.use('/organization_bug_report', require('./routes/organization/bug_report'))
app.use('/organization_subscription', require('./routes/organization/subscription'))
app.use('/organization_payment', require('./routes/organization/payment'))

//admin routes
app.use('/admin_masterAdmin', require('./routes/admin/masterAdmin'))
app.use('/admin_auth', require('./routes/admin/auth'))
app.use('/admin_profile', require('./routes/admin/profile'))
app.use('/admin_user', require('./routes/admin/user'))
app.use('/admin_organization', require('./routes/admin/organization'))
app.use('/admin_kip_application', require('./routes/admin/kip_application'))
app.use('/admin_kip', require('./routes/admin/kip'))
app.use('/admin_job', require('./routes/admin/job'))
app.use('/admin_job_application', require('./routes/admin/job_application'))
app.use('/admin_scholarship', require('./routes/admin/scholarship'))
app.use('/admin_faq', require('./routes/admin/faq'))
app.use('/admin_testimonial', require('./routes/admin/testimonial'))
app.use('/admin_customer_support', require('./routes/admin/customer_support'))
app.use('/admin_bug_report', require('./routes/admin/bug_report'))
app.use('/admin_subscription', require('./routes/admin/subscription'))

/*
app.use('/guest_order', require('./routes/guest/order'))
app.use('/guest_service', require('./routes/guest/service')
*/

/*
//staff routes
app.use('/staff_order', require('./routes/staff/order'))
app.use('/staff_event', require('./routes/staff/event'))
app.use('/staff_hall', require('./routes/staff/hall'))
*/

const port = process.env.PORT || 7000
app.listen(port , ()=>{
    console.log(`server listening at port ${port}`)
})

module.exports = app