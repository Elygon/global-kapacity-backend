const express = require('express')
const router = express.Router()

const Conversation = require('../../models/conversation')
const Message = require('../../models/message')
const authToken = require('../../middleware/authToken')
const { preventFreemiumSendMessage } = require('../../middleware/freemiumlimit')
const cloudinary = require('../../utils/cloudinary')
const uploader = require('../../utils/multer')


// Start or Get a conversation
router.post('/start', authToken, async (req, res) => {
    const { recipientId, recipientType } = req.body
    const userId = req.user._id
    const userType = req.user.account_type === 'Organization' ? 'Organization' : 'User'

    if (!recipientId || !recipientType) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required' })
    }

    try {
        // check if conversation already exists
        const conversation = await Conversation.findOne({
            $and: [
                { "participants.participant_id": userId },
                { "participants.participant_id": recipientId }
            ]
        })

        if (conversation) {
            return res.status(200).send({ status: "ok", msg: "Conversation already exists", conversation })
        }

        // Create a new conversation
        const newConversation = new Conversation({
            participants: [
                {
                    participantType: userType,
                    participant_id: userId
                },
                {
                    participantType: recipientType, // "User" or "Organization"
                    participant_id: recipientId
                }
            ]
        })

        await newConversation.save()

        res.status(200).send({ status: 'ok', msg: 'success', newConversation })

    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Send a text message
router.post('/send_text', authToken, preventFreemiumSendMessage, async (req, res) => {
    const { conversationId, message } = req.body

    if (!message) {
        return res.status(400).send({ status: 'error', msg: 'Message text is required' })
    }

    try {
        const newMsg = new Message({
            conversation_id: conversationId,
            sender_id: req.user._id,
            sender_type: req.user.account_type === 'Organization' ? 'Organization' : 'User',
            msg_type: 'text',
            text: message
        })

        await newMsg.save()

        await Conversation.findByIdAndUpdate(conversationId, {
            last_msg: newMsg._id,
        })

        res.status(200).send({ status: 'ok', msg: 'success', newMsg })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Send media (image/video/audio/file)
router.post('/send_media', authToken, preventFreemiumSendMessage, uploader.single('file'), async (req, res) => {
    const { conversationId } = req.body
    const sender = req.user._id

    if (!conversationId) {
        return res.status(400).send({ status: 'error', msg: 'Conversation ID is required' })
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
            sender_id: sender,
            sender_type: req.user.account_type === 'Organization' ? 'Organization' : 'User',
            media_url: cloud.secure_url,
            msg_type: req.file.mimetype
        })

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            last_msg: newMsg._id,
        })

        res.status(200).send({ status: 'ok', msg: 'success', newMsg })
    } catch (e) {
        res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Get all messages in a conversation
router.post('/messages', authToken, async (req, res) => {
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
router.post('/user_chats', authToken, async (req, res) => {
    const userId = req.user._id

    try {
        // Query using the correct nested field for participants
        const conversations = await Conversation.find({ "participants.participant_id": userId })
            .populate('participants.participant_id', 'name email profile_img') // Populate the actual user/org doc
            .populate('last_msg') // Populate the last message
            .sort({ updatedAt: -1 }) // Sort by updated time

        res.status(200).send({ status: 'ok', msg: 'success', conversations })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


// Delete a specific message (optional)
router.post('/delete', authToken, async (req, res) => {
    const userId = req.user._id
    const { msgId } = req.body

    if (!msgId) {
        return res.status(400).send({ status: 'error', msg: 'Message ID is required' })
    }

    try {
        const msg = await Message.findById(msgId)

        if (!msg) {
            return res.status(404).send({ status: 'error', msg: 'Message not found' })
        }

        // Only the original sender can delete
        if (msg.sender.toString() !== userId.toString()) {
            return res.status(403).send({ status: 'error', msg: 'Not allowed' })
        }

        const conversationId = msg.conversation_id

        // Delete from the database
        await Message.findByIdAndDelete(msgId)

        // Update last message in conversation (if deleted message was the last one)
        const lastMsg = await Message.findOne({ conversation_id: conversationId }).sort({ createdAt: -1 })

        await Conversation.findByIdAndUpdate(conversationId, {
            last_msg: lastMsg ? lastMsg._id : null
        })

        res.status(200).send({ status: 'ok', msg: 'success', msg })
    } catch (e) {
        return res.status(500).send({ status: 'error', msg: 'Error occurred', error: e.message })
    }
})


module.exports = router