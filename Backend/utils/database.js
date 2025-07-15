const mongoose = require('mongoose')

const db = async()=>
    {
        await mongoose.connect('mongodb+srv://rocktheway2akash:gR2Jv3ErtpicZOfo@geminichat.eomv3bj.mongodb.net/geminiChat?retryWrites=true&w=majority&appName=GeminiChat')
    }

module.exports = db;