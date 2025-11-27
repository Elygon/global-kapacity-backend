const nodemailer = require("nodemailer")

const dotenv = require("dotenv")
dotenv.config()

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
})


// OTP Email (User)
const sendOtpEmail = async (email, firstname, otp, expiresInMinutes = 15) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Your verification code",
            html: `<div>
                <p>Hi ${firstname},</p>
                <p>Your verification code is:</p>
                <h2>${otp}</h2>
                <p>This code will expire in ${expiresInMinutes} minutes.</p>
            </div>`
        })

        console.log("OTP email sent:", info.response);
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return { msg: "Error sending OTP email", error };
    }
}

// OTP Email (Organization)
const sendOtpEmailOrg = async (email, company_name, otp, expiresInMinutes = 15) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Your verification code",
            html: `<div>
                <p>Hi ${company_name},</p>
                <p>Your verification code is:</p>
                <h2>${otp}</h2>
                <p>This code will expire in ${expiresInMinutes} minutes.</p>
            </div>`
        })

        console.log("OTP email sent:", info.response)
    } catch (error) {
        console.error("Error sending OTP email:", error)
        return { msg: "Error sending OTP email", error }
    }
}

// Password Reset Email (User)
const sendPasswordReset = async (email, firstname, resetPasswordCode) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity"  <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `<div>
            <div style="display: flex; align-items: center;">
                <img alt="Logo" style="height: 50px; margin-right: 8px; width: 50px;" src="https://drive.google.com/uc?export=view&id=1VxBysUQV0835JiijO4hs24M9A0rZ_Q-d">
                <img alt="Heurekka" style="height: 30px; margin-right: 8px;" src="https://drive.google.com/uc?export=view&id=1REJbJrhQZakh4UD3gypU8OPa-A2RJVZA">
            </div>
            <br/>
            <p style="line-height: 1.2;">Hi ${firstname},</p>
            <p style="line-height: 1.2;">We've received a request to reset your password.</p>
            <p style="line-height: 1.5;">If you didn't make the request, just ignore this message. Otherwise, you can reset your password.</p>        
            <a href=http://localhost:7000/auth_generalAuth/reset_password/${resetPasswordCode}>
                <button style="font-weight: 500;font-size: 14px;cursor: pointer; background-color: rgba(238, 119, 36, 1); border: none; border-radius: 4px; padding: 12px 18px 12px 18px; color: white;">
                    Reset your password
                </button>
            </a>
            <br/>
            <br/>
            <br/>
            <br/>
            <p style="line-height: 1.5">If you did not make this request, please ignore this email. <br /><br />Best regards, <br />Team Cart.</p>
        </div>`
    })

    console.log("Email sent:", info.response)
  } catch (error) {
    console.error("Error sending email:", error)
    return { msg: "Error sending email", error }
  }
}


// Password Reset Email (Organization)
const sendPasswordResetOrg = async (email, company_name, resetPasswordCode) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity"  <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `<div>
            <div style="display: flex; align-items: center;">
                <img alt="Logo" style="height: 50px; margin-right: 8px; width: 50px;" src="https://drive.google.com/uc?export=view&id=1VxBysUQV0835JiijO4hs24M9A0rZ_Q-d">
                <img alt="Heurekka" style="height: 30px; margin-right: 8px;" src="https://drive.google.com/uc?export=view&id=1REJbJrhQZakh4UD3gypU8OPa-A2RJVZA">
            </div>
            <br/>
            <p style="line-height: 1.2;">Hi ${company_name},</p>
            <p style="line-height: 1.2;">We've received a request to reset your password.</p>
            <p style="line-height: 1.5;">If you didn't make the request, just ignore this message. Otherwise, you can reset your password.</p>        
            <a href=http://localhost:7000/auth_generalAuth/reset_password/${resetPasswordCode}>
                <button style="font-weight: 500;font-size: 14px;cursor: pointer; background-color: rgba(238, 119, 36, 1); border: none; border-radius: 4px; padding: 12px 18px 12px 18px; color: white;">
                    Reset your password
                </button>
            </a>
            <br/>
            <br/>
            <br/>
            <br/>
            <p style="line-height: 1.5">If you did not make this request, please ignore this email. <br /><br />Best regards, <br />Team Cart.</p>
        </div>`
    })

    console.log("Email sent:", info.response)
  } catch (error) {
    console.error("Error sending email:", error)
    return { msg: "Error sending email", error }
  }
}


// Password Reset Email (Admin) - Gmail-friendly
const sendPasswordResetAdmin = async (email, firstname, resetPasswordCode) => {
    try {
        const mailOptions = {
            from: `"Global Kapacity"  <${process.env.MAIL_USER}>`, // full email address
            to: email,
            subject: "Admin Reset Password",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                    <h3>Hi ${firstname},</h3>
                    <p>We've received a request to reset your password.</p>
                    <p>If you didn't make the request, ignore this email. Otherwise, click the button below:</p>
                    <a href="http://localhost:7000/admin_auth/reset_password/${resetPasswordCode}" style="text-decoration: none;">
                        <span style="display: inline-block; background-color: #EE7724; color: white; padding: 12px 18px; border-radius: 4px; font-weight: 500;">
                            Reset Password
                        </span>
                    </a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>http://localhost:7000/admin_auth/reset_password/${resetPasswordCode}</p>
                    <hr>
                    <p>Best regards,<br>Team Cart</p>
                </div>
            `,
            text: `Hi ${firstname},\n\nWe've received a request to reset your password.\n\nIf you didn't make the request, ignore this email. Otherwise, visit this link:\nhttp://localhost:1000/staff_auth/reset_password/${resetPasswordCode}\n\nBest regards,\nTeam Cart`
        }

        const info = await transport.sendMail(mailOptions)
        console.log("Email sent:", info.response);
        return { msg: "Email sent successfully", info }
    } catch (error) {
        console.error("Error sending email:", error)
        return { msg: "Error sending email", error }
    }
}


// Confirmation of admin account created
const sendAdminAccountMail = async (email, password, firstname, role) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Welcome to Global Kapacity as ${role}`,
            html: `
                <h2>Hi ${firstname},</h2>
                <p>Your ${role} account has been successfully created.</p>
                <p>Here are your login details:</p>
                <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${password}</li>
                </ul>
                <p>Please log in and change your password immediately.</p>
                <p>Best Regards,<br/>Global Kapacity Management Team</p>
           `,
        })

        console.log("Admin Account Creation Email sent:", info.response)
        return { status: "ok", msg: "Email sent" }
    } catch (error) {
        console.error("Error sending admin account creation email:", error)
        return { status: "error", msg: "Failed to send email", error }
    }
}


// KIP Application Approved
const sendKipApprovalMail = async (email, organization_name) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your KIP Application Has Been Approved 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Application Approved 🎉</h2>
                    <p>Dear ${organization_name},</p>

                    <p>We're excited to inform you that your application to join the 
                    <b>Kapacity Impact Partners (KIP)</b> program has been successfully approved.</p>

                    <p>Welcome aboard! We're looking forward to the positive impact your organization will contribute.</p>

                    <br/>
                    <p>Best regards,<br/>The KIP Management Team</p>
                </div>
            `
        })

        console.log("KIP Approval Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending KIP approval email:", error)
    }
}


// KIP Application Rejected
const sendKipRejectionMail = async (email, organization_name, reason) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Update on Your KIP Application`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Application Update</h2>
                    <p>Dear ${organization_name},</p>

                    <p>Thank you for taking the time to apply for the 
                    <b>Kapacity Impact Partners (KIP)</b> program.</p>

                    <p>After reviewing your submission, we're unable to approve your application at this moment.</p>

                    ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}

                    <p>You may reapply in the future once the required conditions are met.</p>

                    <br/>
                    <p>Best regards,<br/>The KIP Management Team</p>
                </div>
            `
        })

        console.log("KIP Rejection Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending KIP rejection email:", error)
    }
}



// Job Listing Approved
const sendJobApprovalMail = async (email, company_name, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Job Listing Has Been Approved ✔️`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Job Listing Approved ✔️</h2>
                    <p>Dear ${company_name},</p>

                    <p>Your job listing titled <b>${title}</b> has been reviewed and 
                    <b>approved</b> by our platform administrators.</p>

                    <p>The listing is now live and visible to qualified candidates across the platform.</p>

                    <br/>
                    <p>Best regards,<br/>The Job Review Team</p>
                </div>
            `
        })

        console.log("Job Approval Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending Job Approval Email:", error)
    }
}



// Job Listing Rejected
const sendJobRejectionMail = async (email, company_name, title, reason) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Job Listing Could Not Be Approved`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Job Listing Rejected ❌</h2>
                    <p>Dear ${company_name},</p>

                    <p>Your job listing titled <b>${title}</b> has been reviewed, 
                    but cannot be approved at this time.</p>

                    ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}

                    <p>You may update the job posting and resubmit it for review again.</p>

                    <br/>
                    <p>Best regards,<br/>The Job Review Team</p>
                </div>
            `
        })

        console.log("Job Rejection Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending Job Rejection Email:", error)
    }
}



// Job Listing Hidden (taken down after complaints or suspicious observations)
const sendJobHiddenMail = async (email, company_name, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Job Listing Has Been Temporarily Taken Down`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Job Listing Hidden ⚠️</h2>
                    <p>Dear ${company_name},</p>

                    <p>Your job listing titled <b>${title}</b> has been hidden from public view.</p>

                    <p>This action was taken due to reports or activity that require further review.</p>

                    <p>You may update or clarify the posting if needed and request a re-review.</p>

                    <br/>
                    <p>Best regards,<br/>The Job Safety Team</p>
                </div>
            `
        })

        console.log("Job Hidden Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending Job Hidden Email:", error)
    }
}


// Guest Event Completed
const sendGuestEventCompletionMail = async (email, title, hall_name, end_date) => {
    try {
        const info = await transport.sendMail({
            from: `"Classic Crown Hotel" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Event Completed: ${title}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Event Completed ✅</h2>
                    <p>Dear Guest,</p>
                    <p>Your event has been successfully completed.</p>
                    <ul>
                        <li><b>Event:</b> ${title}</li>
                        <li><b>Hall:</b> ${hall_name}</li>
                        <li><b>End Date:</b> ${new Date(end_date).toDateString()}</li>
                    </ul>
                    <p>We hope you had a wonderful experience with us!</p>
                    <p>Thank you for choosing Classic Crown Hotel.</p>
                    <br/>
                    <p>Warm regards,<br/>Classic Crown Hotel Management</p>
                </div>
            `
        })
        console.log("Guest Event Completion Email sent:", info.response)
    } catch (error) {
        console.error("Error sending guest event completion email:", error)
    }
}


// const sendOTP = async (email, otp) => {
//   try {
//     const info = await transport
//       .sendMail({
//         from: `foodkart.dev@gmail.com <${process.env.MAIL_USER}>`,
//         to: email,
//         subject: "One Time Password",
//         html: `<p style="line-height: 1.5">
//         Your OTP verification code is: <br /> <br />
//         <font size="3">${otp}</font> <br />
//         Best regards,<br />
//         Team FoodKart.
//         </p>
//         </div>`,
//       });

//     console.log("Email sent:", info.response);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return { msg: "Error sending email", error };
//   }
// };

// Guest Event Request Received
const sendGuestEventRequestMail = async (email, fullname, event_name, date) => {
    try {
        const info = await transport.sendMail({
            from: `"Classic Crown Hotel"  <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Event Booking Request Received - ${event_name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Event Reservation Request Received 🎉</h2>
                    <p>Dear ${fullname || "Guest"},</p>
                    <p>Your request for the event <b>${event_name}</b> has been successfully recorded.</p>
                    <ul>
                        <li><b>Date:</b> ${new Date(date).toDateString()}</li>
                        <li><b>Status:</b> Pending Staff Approval</li>
                    </ul>
                    <p>Our management team will review your request and assign a suitable hall shortly.</p>
                    <br/>
                    <p>Warm regards,<br/>Hotel Events Team</p>
                </div>
            `,
        })

        console.log("✅ Event Booking Request Email sent:", info.response)
        return { status: "ok", msg: "Email sent" }
    } catch (error) {
        console.error("❌ Error sending event booking request email:", error)
        return { status: "error", msg: "Failed to send email", error }
    }
}


// Guest Event Request Cancellation
const sendGuestEventCancellationMail = async (email, fullname, hallName, date, status) => {
    try {
        // Pick the best phrase depending on approval status
        if (hallName) {
            hallLabel = hallName
        } else if (status === "Pending") {
            hallLabel = "your pending event request"
        } else {
            hallLabel = "your event"
        }

        const info = await transport.sendMail({
            from: `"Classic Crown Hotel"  <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Event Booking Request Cancelled",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Event Reservation Cancelled ❌</h2>
                    <p>Dear ${fullname || "Guest"},</p>
                    <p>Your reservation for <b>${hallLabel}</b> scheduled on <b>${new Date(date).toDateString()}</b> has been successfully cancelled.</p>
                    <p>If this was a mistake, you can make a new booking anytime through our events page.</p>
                    <p>Warm regards,<br/>Hotel Events Team</p>
                </div>
            `,
        })

        console.log("✅ Event Cancellation Email sent:", info.response)
        return { status: "ok", msg: "Email sent" }
    } catch (error) {
        console.error("❌ Error sending event cancellation email:", error)
        return { status: "error", msg: "Failed to send email", error }
    }
}


// User Payment Confirmation
const sendPaymentSuccessMail = async (email, firstname, amount, reference, type = 'general') => {
    try {
        let title = 'Payment Successful'
        if (type === 'Subscription') title = 'Subscription Payment Successful'
        /*if (type === 'order') title = 'Food Order Payment Successful'
        if (type === 'event') title = 'Event Hall Booking Payment Successful'*/

        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Payment Confirmation - Thank you for your payment',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 20px;">
                        <h2 style="color: #2c3e50;">Payment Successful 🎉</h2>
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
            from: `"Global Kapacity" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Payment Confirmation - Thank you for your payment',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 20px;">
                        <h2 style="color: #2c3e50;">Payment Successful 🎉</h2>
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





// const sendAccountVerification = async (email, fullname) => {
//   try {
//     const info = await transport
//       .sendMail({
//         from: `foodkart.dev@gmail.com <${process.env.MAIL_USER}>`,
//         to: email,
//         subject: "Account Verification",
//         html: `<p style="line-height: 1.5">
//         Congratulations ${fullname}, you account has been verified.
//         You can now enjoy the perks that comes with this status.
//         Best regards,<br />
//         Team FoodKart.
//         </p>
//         </div>`,
//       });

//     console.log("Email sent:", info.response);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return { msg: "Error sending email", error };
//   }
// }

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
    sendGuestEventRequestMail,
    sendGuestEventCancellationMail,
    sendGuestEventCompletionMail,
    sendPaymentSuccessMail,
    sendPaymentSuccessMailOrg
}