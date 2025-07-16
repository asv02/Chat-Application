const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('../src/User');

const Chat = sequelize.define('Chat', {}, { timestamps: true });

const Message = sequelize.define('Message', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, { timestamps: true });

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });
Chat.hasMany(Message, { foreignKey: 'chatId' });

const ChatParticipant = sequelize.define('ChatParticipant', {}, { timestamps: false });

User.belongsToMany(Chat, { through: ChatParticipant, as: 'Chats', foreignKey: 'userId' });
Chat.belongsToMany(User, { through: ChatParticipant, as: 'Participants', foreignKey: 'chatId' });

module.exports = { Chat, Message, ChatParticipant,User };
