const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config()

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})


// ===============================
// OTP VERIFICATION
// ===============================
const sendOtpEmail = async (email, otp) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verify Your Account",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Account Verification</h2>
                    <p>Your OTP code is: <b>${otp}</b></p>
                    <p>This code is valid for 10 minutes.</p>
                    <br/>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        })

        console.log("OTP Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending OTP Email:", error)
    }
}

const sendOtpEmailOrg = async (email, otp) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verify Your Organization Account",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Organization Account Verification</h2>
                    <p>Your OTP code is: <b>${otp}</b></p>
                    <p>This code is valid for 10 minutes.</p>
                    <br/>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        })

        console.log("Org OTP Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Org OTP Email:", error)
    }
}


// ===============================
// PASSWORD RESET
// ===============================
const sendPasswordReset = async (email, link) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset Your Password",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Click the link below to reset your password:</p>
                    <a href="${link}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link is valid for 15 minutes.</p>
                    <br/>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        })

        console.log("Password Reset Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Password Reset Email:", error)
    }
}

const sendPasswordResetOrg = async (email, link) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset Organization Password",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Click the link below to reset your organization's password:</p>
                    <a href="${link}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link is valid for 15 minutes.</p>
                    <br/>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        })

        console.log("Org Password Reset Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Org Password Reset Email:", error)
    }
}

const sendPasswordResetAdmin = async (email, link) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset Admin Password",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Admin Password Reset Request</h2>
                    <p>Click the link below to reset your admin password:</p>
                    <a href="${link}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link is valid for 15 minutes.</p>
                    <br/>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        })

        console.log("Admin Password Reset Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Admin Password Reset Email:", error)
    }
}


// ===============================
// ADMIN ACCOUNT CREATION
// ===============================
const sendAdminAccountMail = async (email, password) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Admin Account Created",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome to Global Kapacity Admin</h2>
                    <p>Your admin account has been created successfully.</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Password:</b> ${password}</p>
                    <br/>
                    <p>Please login and change your password immediately.</p>
                </div>
            `
        })

        console.log("Admin Account Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Admin Account Email:", error)
    }
}


// ===============================
// KIP APPLICATION EMAILS
// ===============================
const sendKipApprovalMail = async (email, organization_name) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "KIP Application Approved! 🎉",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Congratulations! 🎉</h2>
                    <p>Dear ${organization_name},</p>
                    <p>We are pleased to inform you that your application to become a Kapacity Impact Partner (KIP) has been approved.</p>
                    <p>You can now access your KIP dashboard and start making an impact.</p>
                    <br/>
                    <p>Welcome to the team!</p>
                </div>
            `
        })

        console.log("KIP Approval Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Approval Email:", error)
    }
}

const sendKipRejectionMail = async (email, organization_name) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Update on Your KIP Application",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Application Update</h2>
                    <p>Dear ${organization_name},</p>
                    <p>Thank you for your interest in becoming a Kapacity Impact Partner.</p>
                    <p>After careful review, we regret to inform you that we cannot proceed with your application at this time.</p>
                    <br/>
                    <p>We encourage you to apply again in the future.</p>
                </div>
            `
        })

        console.log("KIP Rejection Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Rejection Email:", error)
    }
}


// ===============================
// JOB LISTING EMAILS
// ===============================
const sendJobApprovalMail = async (email, company_name, job_title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Job Listing Approved ✅",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Job Listing Approved</h2>
                    <p>Dear ${company_name},</p>
                    <p>Your job listing for <b>${job_title}</b> has been approved and is now live on our platform.</p>
                    <br/>
                    <p>Thank you for using Global Kapacity.</p>
                </div>
            `
        })

        console.log("Job Approval Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Job Approval Email:", error)
    }
}

const sendJobRejectionMail = async (email, company_name, job_title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Job Listing Rejected ❌",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Job Listing Update</h2>
                    <p>Dear ${company_name},</p>
                    <p>Your job listing for <b>${job_title}</b> has been rejected as it does not meet our guidelines.</p>
                    <p>Please review our policies and try again.</p>
                </div>
            `
        })

        console.log("Job Rejection Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Job Rejection Email:", error)
    }
}

const sendJobHiddenMail = async (email, company_name, job_title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Job Listing Hidden ⚠️",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Job Listing Hidden</h2>
                    <p>Dear ${company_name},</p>
                    <p>Your job listing for <b>${job_title}</b> has been hidden by an administrator.</p>
                    <p>If you believe this is a mistake, please contact support.</p>
                </div>
            `
        })

        console.log("Job Hidden Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Job Hidden Email:", error)
    }
}


// ===============================
// TRAINING EMAILS
// ===============================
const trainingApprovalMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Training Approved ✅",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Approved</h2>
                    <p>Dear ${firstname},</p>
                    <p>Your training titled <b>${title}</b> has been approved.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Training Approval Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Training Approval Email:", error)
    }
}

const trainingRejectionMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Training Rejected ❌",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Rejected</h2>
                    <p>Dear ${firstname},</p>
                    <p>Your training titled <b>${title}</b> has been rejected.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Training Rejection Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Training Rejection Email:", error)
    }
}

const trainingHiddenMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Training Hidden ⚠️",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Hidden</h2>
                    <p>Dear ${firstname},</p>
                    <p>Your training titled <b>${title}</b> has been hidden.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Training Hidden Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Training Hidden Email:", error)
    }
}

// Helper to format recipient name
const formatRecipientName = (user) => {
    if (user.account_type === 'organization') {
        return user.company_name
    }
    return `${user.firstname} ${user.lastname}`
}

const trainingToKipMail = async (email, kipName, trainingTitle, user) => {
    try {
        const recipientName = formatRecipientName(user)
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `New Training Assigned: ${trainingTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>New Training Assignment</h2>
                    <p>Dear ${kipName},</p>
                    <p>You have been selected as the Impact Partner for a new training:</p>
                    <p><b>Title:</b> ${trainingTitle}</p>
                    <p><b>Submitted By:</b> ${recipientName}</p>
                    <p>Please log in to your dashboard to review and manage this training.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Training To KIP Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Training To KIP Email:", error)
    }
}

const trainingNotifyKipMail = async (email, kipName, trainingTitle) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Training Update: ${trainingTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Update</h2>
                    <p>Dear ${kipName},</p>
                    <p>There is an update regarding the training: <b>${trainingTitle}</b>.</p>
                    <p>Please check your dashboard for details.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Training Notify KIP Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Training Notify KIP Email:", error)
    }
}

const kipAcceptsTrainingMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "KIP Accepted Your Training ✅",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Accepted</h2>
                    <p>Dear ${firstname},</p>
                    <p>The Impact Partner has accepted to manage your training: <b>${title}</b>.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("KIP Accepts Training Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Accepts Training Email:", error)
    }
}

const kipRejectsTrainingMail = async (email, firstname, title, reason) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "KIP Declined Your Training ❌",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Declined</h2>
                    <p>Dear ${firstname},</p>
                    <p>The Impact Partner has declined to manage your training: <b>${title}</b>.</p>
                    <p><b>Reason:</b> ${reason}</p>
                    <p>Please select another Impact Partner.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("KIP Rejects Training Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Rejects Training Email:", error)
    }
}


// ===============================
// SCHOLARSHIP EMAILS
// ===============================
const scholarshipApprovalMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Scholarship Approved ✅",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Scholarship Approved</h2>
                    <p>Dear ${firstname},</p>
                    <p>Your scholarship titled <b>${title}</b> has been approved.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Scholarship Approval Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Scholarship Approval Email:", error)
    }
}

const scholarshipRejectionMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Scholarship Rejected ❌",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Scholarship Rejected</h2>
                    <p>Dear ${firstname},</p>
                    <p>Your scholarship titled <b>${title}</b> has been rejected.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Scholarship Rejection Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Scholarship Rejection Email:", error)
    }
}

const scholarshipHiddenMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Scholarship Hidden ⚠️",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Scholarship Hidden</h2>
                    <p>Dear ${firstname},</p>
                    <p>Your scholarship titled <b>${title}</b> has been hidden.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Scholarship Hidden Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Scholarship Hidden Email:", error)
    }
}

const scholarshipToKipMail = async (email, kipName, scholarshipTitle, user) => {
    try {
        const recipientName = formatRecipientName(user)
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `New Scholarship Assigned: ${scholarshipTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>New Scholarship Assignment</h2>
                    <p>Dear ${kipName},</p>
                    <p>You have been selected as the Impact Partner for a new scholarship:</p>
                    <p><b>Title:</b> ${scholarshipTitle}</p>
                    <p><b>Submitted By:</b> ${recipientName}</p>
                    <p>Please log in to your dashboard to review and manage this scholarship.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Scholarship To KIP Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Scholarship To KIP Email:", error)
    }
}

const scholarshipNotifyKipMail = async (email, kipName, scholarshipTitle) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Scholarship Update: ${scholarshipTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Scholarship Update</h2>
                    <p>Dear ${kipName},</p>
                    <p>There is an update regarding the scholarship: <b>${scholarshipTitle}</b>.</p>
                    <p>Please check your dashboard for details.</p>
                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Scholarship Notify KIP Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Scholarship Notify KIP Email:", error)
    }
}


// ===============================
// SCHOLARSHIP — KIP ACCEPTED
// ===============================
const kipAcceptsScholarshipMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Scholarship Listing Has Been Approved by the Impact Partner ✔️`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">

                    <h2>Scholarship Accepted ✔️</h2>

                    <p>Dear ${firstname},</p>

                    <p>Your scholarship titled <b>${title}</b> has been reviewed and 
                    accepted by the selected Impact Partner.</p>

                    <p>The scholarship will now proceed to the next stage of preparation and coordination.</p>

                    <br/>
                    <p>We will keep you informed all through the process.</p>
                    <br/>

                    <p>Best regards,<br/>Kapacity Scholarship Review Team</p>
                </div>
            `
        })

        console.log("KIP Accepts Scholarship Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Accepts Scholarship Email:", error)
    }
}




// ===============================
// SCHOLARSHIP — KIP REJECTED
// ===============================
const kipRejectsScholarshipMail = async (email, firstname, title, kip_rejection_reason) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Selected Impact Partner Declined the Scholarship ❌`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">

                    <h2>Scholarship Declined ❌</h2>

                    <p>Dear ${firstname},</p>

                    <p>The Impact Partner assigned to your Scholarship titled 
                    <b>${title}</b> has declined to manage it.</p>

                    <p><b>Reason:</b> ${kip_rejection_reason}</p>

                    <p>Please log in to your dashboard to select another Impact Partner 
                    so the scholarship can proceed.</p>

                    <br/>
                    <p>If you need assistance, do not hesitate to reach out to support.</p>

                    <br/>
                    <p>Best regards,<br/>Kapacity Scholarship Review Team</p>
                </div>
            `
        })

        console.log("KIP Rejects Scholarship Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Rejects Scholarship Email:", error)
    }
}


// User Payment Confirmation
const sendPaymentSuccessMail = async (email, firstname, amount, reference, type = 'general') => {
    try {
        let title = 'Payment Successful'
        if (type === 'Registration') title = 'Registration Payment Successful'
        /*if (type === 'order') title = 'Food Order Payment Successful'
        if (type === 'event') title = 'Event Hall Booking Payment Successful'*/

        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `${title} 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 20px;">
                        <h2 style="color: #2c3e50;">${title} 🎉</h2>
                        <p>Dear <strong>${firstname}</strong>,</p>
                        <p>We have received your payment of <strong>₦${amount}</strong>.</p>
                        <p>Your payment reference is <strong>${reference}</strong>.</p>
                        <p>Thank you for subscribing to <strong>Global Kapacity</strong>! Your subscription is now active.</p>
                        <p>We look forward to helping you explore opportunities, connect with professionals and get the most
                        out of our platform!</p>
                        <p style="margin-top: 20px;">Warm regards,<br>Kapacity Management</p>
                    </div>
                </div>
            `
        })

        console.log("✅ Payment confirmation Email sent:", info.response)
        return { status: "ok", msg: "Email sent" }
    } catch (error) {
        console.error('❌Error sending payment email:', error)
        return { status: "error", msg: "Failed to send email", error }
    }
}


// Organization Payment Confirmation
const sendPaymentSuccessMailOrg = async (email, company_name, amount, reference, type = 'general') => {
    try {
        let title = 'Payment Successful'
        if (type === 'Subscription') title = 'Subscription Payment Successful'
        /*if (type === 'order') title = 'Food Order Payment Successful'
        if (type === 'event') title = 'Event Hall Booking Payment Successful'*/

        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `${title} 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 20px;">
                        <h2 style="color: #2c3e50;">${title} 🎉</h2>
                        <p>Dear <strong>${company_name}</strong>,</p>
                        <p>We have received your payment of <strong>₦${amount}</strong>.</p>
                        <p>Your payment reference is <strong>${reference}</strong>.</p>
                        <p>Thank you for subscribing to <strong>Global Kapacity</strong>! Your subscription is now active.</p>
                        <p>We look forward to helping you explore opportunities, connect with professionals and get the most
                        out of our platform!</p>
                        <p style="margin-top: 20px;">Warm regards,<br>Kapacity Management</p>
                    </div>
                </div>
            `
        })

        console.log("✅ Payment confirmation Email sent:", info.response)
        return { status: "ok", msg: "Email sent" }
    } catch (error) {
        console.error('❌Error sending payment email:', error)
        return { status: "error", msg: "Failed to send email", error }
    }
}


// Subscription Success Email
const sendSubscriptionSuccessEmail = async (email, name, plan, amount, billing_cycle) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Subscription Successful! 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Subscription Confirmed 🎉</h2>
                    <p>Dear ${name},</p>

                    <p>Thank you for subscribing to our <b>${billing_cycle}</b> premium plan.</p>

                    <p><b>Plan Details:</b></p>
                    <ul>
                        <li><b>Plan:</b> ${plan}</li>
                        <li><b>Billing Cycle:</b> ${billing_cycle}</li>
                        <li><b>Amount:</b> ${amount}</li>
                    </ul>

                    <p>Your premium features are now active.</p>

                    <br/>
                    <p>Best regards,<br/>Global Kapacity Team</p>
                </div>
            `
        })

        console.log("Subscription Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending Subscription Email:", error)
    }
}


module.exports = {
    sendOtpEmail,
    sendOtpEmailOrg,
    sendPasswordReset,
    sendPasswordResetOrg,
    sendPasswordResetAdmin,
    sendAdminAccountMail,
    sendKipApprovalMail,
    sendKipRejectionMail,
    sendJobApprovalMail,
    sendJobRejectionMail,
    sendJobHiddenMail,
    trainingApprovalMail,
    trainingRejectionMail,
    trainingHiddenMail,
    trainingToKipMail,
    trainingNotifyKipMail,
    kipAcceptsTrainingMail,
    kipRejectsTrainingMail,
    scholarshipApprovalMail,
    scholarshipRejectionMail,
    scholarshipHiddenMail,
    scholarshipToKipMail,
    scholarshipNotifyKipMail,
    kipAcceptsScholarshipMail,
    kipRejectsScholarshipMail,
    sendPaymentSuccessMail,
    sendPaymentSuccessMailOrg,
    sendSubscriptionSuccessEmail
}