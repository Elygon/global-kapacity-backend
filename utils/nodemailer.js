const nodemailer = require("nodemailer")

const dotenv = require("dotenv")
dotenv.config()


// ----------------------
// EMAIL TRANSPORT CONFIG
// ----------------------
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
})


// ---------------------------------------------
// Reusable Helper (PLACE IT AT THE TOP)
// ---------------------------------------------
const formatRecipientName = (posted_by) => {
    if (!posted_by) return "there"

    // organization
    if (posted_by.company_name) {
        return posted_by.company_name;
    }

    // user
    if (posted_by.firstname) {
        return posted_by.firstname
    }

    return "there" // fallback
}


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
            <p style="line-height: 1.5">If you did not make this request, please ignore this email. <br /><br />Best regards, <br />Kapacity Management Team.</p>
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
            <p style="line-height: 1.5">If you did not make this request, please ignore this email. <br /><br />Best regards, <br />Kapacity Management Team.</p>
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
            text: `Hi ${firstname},\n\nWe've received a request to reset your password.\n\nIf you didn't make the request, ignore this email. Otherwise, visit this link:\nhttp://localhost:7000/admin_auth/reset_password/${resetPasswordCode}\n\nBest regards,\nKapacity Management Team`
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


// Training Listing Approved
const trainingApprovalMail = async (email, name, title, posted_by_model) => {
    // Determine message depending on who posted
    const visibilityMessage = posted_by_model === "Organization"
        ? "Your training is now live and visible to learners on the platform."
        : "Your training has been approved by the admin and is awaiting confirmation from your selected Impact Partner before going live."

    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Training Has Been Approved ✔️`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Approved ✔️</h2>
                    <p>Dear ${name},</p>

                    <p>Your training titled <b>${title}</b> has been reviewed and <b>approved</b> by our platform administrators.</p>

                    <p>${visibilityMessage}</p>

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


//Training Listing Rejected
const trainingRejectionMail = async (email, posted_by, title, reason) => {
    const name = formatRecipientName(posted_by)

    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Training Could Not Be Approved`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Rejected ❌</h2>
                    <p>Dear ${name},</p>

                    <p>Your training titled <b>${title}</b> has been reviewed, 
                    but cannot be approved at this time.</p>

                    ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}

                    <p>You may update the training details and submit it again for review.</p>

                    <br/>
                    <p>Best regards,<br/>Global Kapacity Review Team</p>
                </div>
            `
        })

        console.log("Training Rejection Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending Training Rejection Email:", error)
    }
}


// Training Listing Hidden (taken down after complaints or suspicious observations)
const trainingHiddenMail = async (email, posted_by, title) => {
    const name = formatRecipientName(posted_by)

    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Training Has Been Temporarily Hidden`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Training Hidden ⚠️</h2>
                    <p>Dear ${name},</p>

                    <p>Your training titled <b>${title}</b> has been hidden from public view.</p>

                    <p>This action was taken because further review is required.</p>

                    <p>You may update the training if needed and request another review.</p>

                    <br/>
                    <p>Best regards,<br/>Global Kapacity Safety Team</p>
                </div>
            `
        })

        console.log("Training Hidden Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending Training Hidden Email:", error)
    }
}


// Approved Training sent to selected Impact Partner for verification
const trainingToKipMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Training Has Been Sent to the Selected Impact Partner`,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Training Forwarded to Impact Partner ✔️</h2>
                    <p>Dear ${firstname},</p>

                    <p>Your training titled <b>${title}</b> has been approved 
                    by the admin and forwarded to your selected Impact Partner for review.</p>

                    <p>The Impact Partner will either accept to manage this training 
                    or decline it. You will be notified once we receive their response.</p>

                    <br/>
                    <p>Warm regards,<br/>Kapacity Admin Team</p>
                </div>
            `
        })

        console.log("Training To Selected Impact Partner Email sent:", info.response)
        return { status: "ok", msg: "Email sent" }
    } catch (err) {
        console.error("Error sending user training->KIP email:", err)
    }
}


// Training Listing sent for selected partner response
const trainingNotifyKipMail = async (email, organization_name, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `You Have Been Selected as Impact Partner`,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Impact Partner Assignment</h2>
                    <p>Dear ${organization_name},</p>

                    <p>You have been selected as the Impact Partner for the training titled 
                    <b>${title}</b>.</p>

                    <p>Please review the training details and let us know if you 
                    <b>accept</b> or <b>decline</b> managing this training.</p>

                    <p>Your decision will be forwarded to the training owner and the admin.</p>

                    <br/>
                    <p>Warm regards,<br/>Kapacity Team</p>
                </div>
            `
        })
    } catch (err) {
        console.error("Error sending KIP notification email:", err)
    }
}


// ===============================
// TRAINING — KIP ACCEPTED
// ===============================
const kipAcceptsTrainingMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Training Has Been Approved by the Impact Partner ✔️`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">

                    <h2>Training Accepted ✔️</h2>

                    <p>Dear ${firstname},</p>

                    <p>Your training titled <b>${title}</b> has been reviewed and 
                    accepted by the selected Impact Partner.</p>

                    <p>The training will now proceed to the next stage of preparation and coordination.</p>

                    <br/>
                    <p>We will keep you informed all through the process.</p>
                    <br/>

                    <p>Best regards,<br/>Kapacity Training Review Team</p>
                </div>
            `
        })

        console.log("KIP Accepts Training Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Accepts Training Email:", error)
    }
}




// ===============================
// TRAINING — KIP REJECTED
// ===============================
const kipRejectsTrainingMail = async (email, firstname, title, kip_rejection_reason) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Selected Impact Partner Declined the Training ❌`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">

                    <h2>Training Declined ❌</h2>

                    <p>Dear ${firstname},</p>

                    <p>The Impact Partner assigned to your training titled 
                    <b>${title}</b> has declined to manage it.</p>

                    <p><b>Reason:</b> ${kip_rejection_reason}</p>

                    <p>Please log in to your dashboard to select another Impact Partner 
                    so the training can proceed.</p>

                    <br/>
                    <p>If you need assistance, do not hesitate to reach out to support.</p>

                    <br/>
                    <p>Best regards,<br/>Kapacity Training Review Team</p>
                </div>
            `
        })

        console.log("KIP Rejects Training Email Sent:", info.response)
    } catch (error) {
        console.error("Error sending KIP Rejects Training Email:", error)
    }
}


// Scholarship Listing Approved
const scholarshipApprovalMail = async (email, name, title, posted_by_model) => {
    // Determine message depending on who posted
    const visibilityMessage = posted_by_model === "Organization"
        ? "Your scholarship is now live and visible to learners on the platform."
        : "Your scholarship has been approved by the admin and is awaiting confirmation from your selected Impact Partner before going live."

    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Scholarship Has Been Approved ✔️`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Scholarship Approved ✔️</h2>
                    <p>Dear ${name},</p>

                    <p>Your scholarship titled <b>${title}</b> has been reviewed and <b>approved</b> by our platform administrators.</p>

                    <p>${visibilityMessage}</p>

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


//Scholarship Listing Rejected
const scholarshipRejectionMail = async (email, posted_by, title, reason) => {
    const name = formatRecipientName(posted_by)

    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Scholarship Could Not Be Approved`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Scholarship Rejected ❌</h2>
                    <p>Dear ${name},</p>

                    <p>Your scholarship titled <b>${title}</b> has been reviewed, 
                    but cannot be approved at this time.</p>

                    ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}

                    <p>You may update the scholarship details and submit it again for review.</p>

                    <br/>
                    <p>Best regards,<br/>Global Kapacity Review Team</p>
                </div>
            `
        })

        console.log("Scholarship Rejection Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending Scholarship Rejection Email:", error)
    }
}


// Scholarship Listing Hidden (taken down after complaints or suspicious observations)
const scholarshipHiddenMail = async (email, posted_by, title) => {
    const name = formatRecipientName(posted_by)

    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Scholarship Has Been Temporarily Hidden`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Scholarship Hidden ⚠️</h2>
                    <p>Dear ${name},</p>

                    <p>Your scholarship titled <b>${title}</b> has been hidden from public view.</p>

                    <p>This action was taken because further review is required.</p>

                    <p>You may update the scholarship if needed and request another review.</p>

                    <br/>
                    <p>Best regards,<br/>Global Kapacity Safety Team</p>
                </div>
            `
        })

        console.log("Scholarship Hidden Email Sent:", info.response)

    } catch (error) {
        console.error("Error sending Scholarship Hidden Email:", error)
    }
}


// Approved Scholarship sent to selected Impact Partner for verification
const scholarshipToKipMail = async (email, firstname, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your Scholarship Has Been Sent to the Selected Impact Partner`,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Scholarship Forwarded to Impact Partner ✔️</h2>
                    <p>Dear ${firstname},</p>

                    <p>Your scholarship titled <b>${title}</b> has been approved 
                    by the admin and forwarded to your selected Impact Partner for review.</p>

                    <p>The Impact Partner will either accept to manage this scholarship 
                    or decline it. You will be notified once we receive their response.</p>

                    <br/>
                    <p>Warm regards,<br/>Kapacity Admin Team</p>
                </div>
            `
        })

        console.log("Scholarship To Selected Impact Partner Email sent:", info.response)
        return { status: "ok", msg: "Email sent" }
    } catch (err) {
        console.error("Error sending user scholarship->KIP email:", err)
    }
}


// Scholarship Listing sent for selected partner response
const scholarshipNotifyKipMail = async (email, organization_name, title) => {
    try {
        const info = await transport.sendMail({
            from: `"Global Kapacity" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `You Have Been Selected as Impact Partner`,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Impact Partner Assignment</h2>
                    <p>Dear ${organization_name},</p>

                    <p>You have been selected as the Impact Partner for the scholarship titled 
                    <b>${title}</b>.</p>

                    <p>Please review the scholarship details and let us know if you 
                    <b>accept</b> or <b>decline</b> managing this scholarship.</p>

                    <p>Your decision will be forwarded to the scholarship owner and the admin.</p>

                    <br/>
                    <p>Warm regards,<br/>Kapacity Team</p>
                </div>
            `
        })
    } catch (err) {
        console.error("Error sending KIP notification email:", err)
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
    sendPaymentSuccessMailOrg
}