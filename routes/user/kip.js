const express = require("express")
const router = express.Router()

const authToken = require("../../middleware/authToken")
const KIP = require("../../models/kip")
const { preventFreemiumKIP } = require("../../middleware/freemiumlimit")



// ==========================
// VIEW ALL KIP MEMBERS
// ==========================
router.post("/all", authToken, preventFreemiumKIP, async (req, res) => {
    try {
        const kips = await KIP.findOne().sort({ createdAt: -1 })
        if (!kips) {
            return res.status(404).send({ status: 'error', msg: "No Kapacity Impact Partner yet" })
        }

        if (!kips.length) {
            return res.status(200).send({ status: 'ok', msg: 'No Impact Partner found.', count: 0 })
        }

        res.status(200).send({ status: 'ok', msg: "succcess", count: kips.length, kips })
    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


// ==========================
// VIEW A SPECIFIC KIP MEMBER
// ==========================
router.post("/view", authToken, async (req, res) => {
    const { kipId } = req.body
    if (!kipId) {
        return res.status(400).send({ status: 'error', msg: "Impact Partner ID is required" })
    }
    
    try {
        const member = await KIP.findById(kipId)
        if (!member) {
            return res.status(404).send({ status: 'error', msg: "Impact Partner not found" })
        }

        res.status(200).send({ status: 'ok', msg: "success", member })

    } catch (error) {
        res.status(500).send({ status: 'error', msg: "Server error", error })
    }
})


module.exports = router