// Generate a random 6-digit OTP as string
const generateOtp = () => 
    ( Math.floor(100000 + Math.random() * 900000).toString() )

// Validate OTP (simple equality check, can extend later for expiry)
const validateOtp = (storedOtp, providedOtp) =>  {
    return storedOtp === providedOtp
}

module.exports = { generateOtp, validateOtp }