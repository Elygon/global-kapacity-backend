const express = require('express')
const router = express.Router()

const Conversation = require('../../models/conversation')
const Message = require('../../models/message')
const authToken = require('../../middleware/authToken')
const { preventFreemiumSendMessage } = require('../../middleware/freemiumlimit')
const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')



// Start or Get a conversation
router.post('/start', authToken, async(req, res) => {
    const { recipientId } = req.body
    const userId = req.user._id

    if (!recipientId) {
        return res.status(400).send({ status: 'error', msg: 'Recipient ID is required' })
    }

    try {
        let conversation = await Conversation.findOne({ participants: { $all: [userId, recipientId]} })
        if (!conversation) {
            conversation = new Conversation({ participants: [userId, recipientId] })
            await conversation.save()
        } res.status(200).send({ status: 'ok', msg: 'success', conversation })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Send a text message
router.post('/send_text', authToken, preventFreemiumSendMessage, async(req, res) => {
    const { conversationId, message } = req.body

    if (!message) {
        return res.status(400).send({ status: 'error', msg: 'Message text is required' })
    }

    try {
        const newMsg = new Message({
            conversationId,
            sender: req.user._id,
            msg_type: 'text',
            text: message
        })

        await newMsg.save()

        await Conversation.findByIdAndUpdate(conversationId, {
            last_msg: message,
            last_msgAt: new Date()
        }) 
        
        res.status(200).send({ status: 'ok', msg: 'success', newMsg })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Send media (image/video/audio/file)
router.post('/send_media', authToken, preventFreemiumSendMessage, uploader.single('file'), async(req, res) => {
    const { conversationId } = req.body
    const sender = req.user._id

    if (!conversationId) {
        return res.status(400).send({ status: 'error', msg: 'Conversation ID is required'})
    }

    if (!req.file) {
        return res.status(400).send({ status: 'error', msg: 'No file uploaded' })
    }

    try {
        // upload file to cloudinary
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto"
        })

        // Create message entry
        const newMsg = await Message.create({
            conversation_id: conversationId,
            sender,
            media_url: cloud.secure_url,
            msg_type: req.file.mimetype
        })

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            last_msg: '[media]',
            last_msg_at: new Date()
        })
        
        res.status(200).send({ status: 'ok', msg: 'success', newMsg })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message})
    }
})


// Get all messages in a conversation
router.post('/messages', authToken, async(req, res) => {
    try {
        const { conversationId, limit = 50, skip = 0 } = req.body
        if (!conversationId) {
            return res.status(400).send({ status: 'error', msg: 'Conversation ID is required' })
        }
        const msgs = await Message.find({ conversation_id: conversationId })
        .sort({ createdAt: -1 }).skip(skip).limit(limit)

        res.status(200).send({ status: 'ok', msg: 'success', msgs })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Get all conversations of the logged-in user
router.post('/user_chats', authToken, async(req, res) => {
    const userId = req.user._id

    try {
        const conversations = await Conversation.find({ participants: { $in: [userId] } })
        .populate('participants', 'name email profile_img').sort({ last_msg_at: -1 })

        res.status(200).send({ status: 'ok', msg: 'success', conversations })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Delete a specific message (optional)
router.post('/delete', authToken, async(req, res) => {
    const userId = req.user._id
    const { msgId } = req.body

    if (!msgId) {
        return res.status(400).send({ status: 'error', msg: 'Message ID is required'})
    }

    try {
        const msg = await Message.findById(id)
        
        if (!msg) {
            return res.status(404).send({ status: 'error', msg: 'Message not found'})
        }

        // Only the original sender can delete
        if (msg.sender.toString() !== userId.toString()) {
            return res.status(403).send({ status: 'error', msg: 'Not allowed' })
        }

        const conversationId = msg.conversation_id

        // Delete from the database
        await Message.findByIdAndDelete(msgId)

        // Update last message in conversation (if deleted message was the last one)
        const lastMsg = await Message.find({ conversation_id: conversationId }).sort({ createdAt: -1 }).limit(1)

        await Conversation.findByIdAndUpdate(conversationId, {
            last_msg: lastMsg.length > 0 ? (lastMsg[0].text || '[media]') : '',
            last_msg_at: lastMsg.length > 0 ? lastMsg[0].createdAt: null
        })

        await msg.deleteOne()
        res.status(200).send({ status: 'ok', msg: 'success', msg })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


module.exports = router