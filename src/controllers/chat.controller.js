const ChatService = require("../services/chat.service");

const ChatController = {
    async getOrCreateRoom(req, res) {
        try {
            const { targetUserId } = req.body;
            const currentUserId = req.user.id;
            const currentUserRole = req.user.role;

            if (!targetUserId) {
                return res.status(400).json({
                    success: false,
                    message: "targetUserId is required"
                });
            }

            let jobseekerId, employerId;
            if (currentUserRole === 'JOBSEEKER') {
                jobseekerId = currentUserId;
                employerId = targetUserId;
            } else if (currentUserRole === 'EMPLOYER') {
                jobseekerId = targetUserId;
                employerId = currentUserId;
            } else {
                // If it's ADMIN or TRAINING_CENTRE, support them as well or default
                return res.status(400).json({
                    success: false,
                    message: "Only JOBSEEKER or EMPLOYER can initiate a room currently"
                });
            }

            const room = await ChatService.getOrCreateRoom(jobseekerId, employerId);
            return res.status(200).json({
                success: true,
                message: "Chat room fetched or created successfully",
                data: room
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get or create chat room",
                error: error.message
            });
        }
    },

    async getUserRooms(req, res) {
        try {
            const userId = req.user.id;
            const rooms = await ChatService.getUserRooms(userId);
            return res.status(200).json({
                success: true,
                message: "User chat rooms fetched successfully",
                data: rooms
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch user chat rooms",
                error: error.message
            });
        }
    },

    async getRoomMessages(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user.id;
            const { limit = 20, cursor } = req.query;

            // Optional: verify that the user belongs to the room
            const room = await ChatService.getRoomById(roomId);
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: "Chat room not found"
                });
            }

            if (room.jobseekerId !== userId && room.employerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied: You are not a member of this chat room"
                });
            }

            const messages = await ChatService.getRoomMessages(roomId, limit, cursor);
            return res.status(200).json({
                success: true,
                message: "Messages fetched successfully",
                data: messages,
                nextCursor: messages.length === Number(limit) ? messages[0].id : null
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch messages",
                error: error.message
            });
        }
    }
};

module.exports = ChatController;
