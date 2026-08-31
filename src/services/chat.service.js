const ChatModel = require("../models/chat.model");

const ChatService = {
    async getOrCreateRoom(jobseekerId, employerId) {
        return await ChatModel.getOrCreateRoom(jobseekerId, employerId);
    },

    async getUserRooms(userId) {
        return await ChatModel.getUserRooms(userId);
    },

    async getRoomMessages(roomId, limit, cursor) {
        return await ChatModel.getRoomMessages(roomId, limit, cursor);
    },

    async createMessage(roomId, senderId, message) {
        return await ChatModel.createMessage(roomId, senderId, message);
    },

    async getRoomById(roomId) {
        return await ChatModel.getRoomById(roomId);
    }
};

module.exports = ChatService;
