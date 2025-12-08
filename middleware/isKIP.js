const KIP = require('../models/kip')

const isKIP = async (req, res, next) => {
    if (!req.user?.id) {
        return res.status(401).send({ status: "error", msg: "Unauthorized" });
    }

    // Check if this user is a registered KIP
    const kip = await KIP.findOne({ user_id: req.user.id });

    if (!kip) {
        return res.status(403).send({ status: "error", msg: "Access denied. You are not a Kapacity Impact Partner." })
    }

    // Check if approved
    if (!kip.approvedBy) { 
        return res.status(403).send({ status: "error", msg: "Your Impact Partner application is not approved yet." })
    }

    // Check if active
    if (kip.status !== "Active") {
        return res.status(403).send({ status: "error", msg: "Your Impact Partnership is currently suspended." })
    }

    // Attach KIP data to req
    req.kip = kip

    next()
}

module.exports = isKIP