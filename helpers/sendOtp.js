const { sendOtpEmail } = require('../../utils/nodemailer')
const { sendSmsOtp, sendWhatsappOtp } = require('../../utils/twilio')
const sendMessage = require('../../utils/africastalking')

// channel: "email", "sms", or "whatsapp"
const sendOtp = async (account, otp, channel) => {
    const { email, phone_no, firstname, lastname, company_name } = account

    switch(channel.toLowerCase()) {
        case 'email':
            await sendOtpEmail(email, firstname || company_name, otp)
            break
        case 'sms':
            await sendSmsOtp(phone_no, otp)
            break
        case 'whatsapp':
            await sendWhatsappOtp(phone_no, otp)
            break
        default:
            // fallback to email if invalid channel
            await sendOtpEmail(email, firstname || company_name, otp)
    }

    return { status: 'ok', msg: `OTP sent via ${channel}` }
}

module.exports = sendOtp