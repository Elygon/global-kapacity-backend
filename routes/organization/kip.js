const express = require("express")
const router = express.Router()

const authToken = require("../../middleware/authToken")
const KIP = require("../../models/kip")
const { preventFreemiumKIP } = require("../../middleware/freemiumlimit")



// ==========================
// VIEW ALL KIP MEMBERS
// ==========================
router.post("/all", authToken, async (req, res) => {
    try {
        const kips = await KIP.findOne().sort({ createdAt: -1 })
        if (!kips) {
            return res.status(404).send({ status: 'error', msg: "No KIP member yet" })
        }

        if (!kips.length) {
            return res.status(200).send({ status: 'ok', msg: 'No KIPs found.', count: 0 })
        }

        res.status(200).send({ status: 'ok', msg: "succcess", count: kips.length, kips })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// VIEW A SPECIFIC KIP MEMBER
// ==========================
router.post("/view", authToken, preventFreemiumKIP, async (req, res) => {
    const { kipId } = req.body
    if (!kipId) {
        return res.status(400).send({ status: 'error', msg: "KIP ID is required" })
    }
    
    try {
        const member = await KIP.findById(kipId)
        if (!member) {
            return res.status(404).send({ status: 'error', msg: "KIP member not found" })
        }

        res.status(200).send({ status: 'ok', msg: "success", member })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


module.exports = router