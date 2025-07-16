const express = require('express');
const router = express.Router();
const { Chat, Message, ChatParticipant, User } = require('../models/Chat');
const auth = require('../middleware/auth');
const {GEMINI_API_KEY} = require('../utils/Constants')
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

router.post('/chatroom', auth, async (req, res) => {
    try {
        const user = req.user;
        const chat = await Chat.create();
        await ChatParticipant.create({ userId: user.id, chatId: chat.id });
        res.status(201).json({ message: 'Chatroom created', chatId: chat.id });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create chatroom', error: err.message });
    }
});

router.get('/chatroom', auth, async (req, res) => {
    try {
        const user = req.user;
        const chats = await Chat.findAll({
            include: [
                {
                    model: User,
                    as: 'Participants',
                    attributes: ['id', 'firstname', 'lastname', 'ContactNumber'],
                    through: { attributes: [] },
                    where: { id: user.id }
                }
            ]
        });
        res.status(200).json({ chatrooms: chats });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch chatrooms', error: err.message });
    }
});

router.get('/chatroom/:id', auth, async (req, res) => {
    try {
        const chat = await Chat.findByPk(req.params.id, {
            include: [
                { model: User, as: 'Participants', attributes: ['id', 'firstname', 'lastname', 'ContactNumber'] },
                { model: Message, include: [{ model: User, as: 'sender', attributes: ['id', 'firstname', 'lastname', 'ContactNumber'] }] }
            ]
        });
        if (!chat) return res.status(404).json({ message: 'Chatroom not found' });
        res.status(200).json({ chatroom: chat });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch chatroom', error: err.message });
    }
});

router.post('/chatroom/:id/message', auth, async (req, res) => {
    try {
        const user = req.user;
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Message text is required' });

        const isParticipant = await ChatParticipant.findOne({ where: { userId: user.id, chatId: req.params.id } });
        if (!isParticipant) return res.status(403).json({ message: 'Not a participant of this chatroom' });

        // Save user message
        const message = await Message.create({ chatId: req.params.id, senderId: user.id, text });

        // Fetch chat history
        const messages = await Message.findAll({
            where: { chatId: req.params.id },
            order: [['createdAt', 'ASC']],
            include: [{ model: User, as: 'sender', attributes: ['id', 'firstname', 'lastname', 'ContactNumber'] }]
        });

        const history = messages.map(msg => ({
            role: msg.senderId ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

        history.push({
            role: "user",
            parts: [{ text }]
        });

        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: history
        });

        const geminiResponse = await chat.sendMessage({ message: text });
        const geminiText = geminiResponse.text; // to show to user

        const geminiMessage = await Message.create({ // to store it
            chatId: req.params.id,
            senderId: null,
            text: geminiText
        });

        res.status(201).json({
            message: 'Message sent',
            data: {
                userMessage: message,
                geminiMessage: geminiMessage,
                geminiText: geminiText
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
});

module.exports = router;
