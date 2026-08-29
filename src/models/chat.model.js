const prisma = require("../config/db");

const ChatModel = {
    async getOrCreateRoom(jobseekerId, employerId) {
        let room = await prisma.chatRoom.findUnique({
            where: {
                jobseekerId_employerId: { jobseekerId, employerId }
            },
            include: {
                jobseeker: { select: { id: true, fullName: true, profilePicture: true, role: true } },
                employer: { select: { id: true, fullName: true, profilePicture: true, role: true, companyName: true } }
            }
        });

        if (!room) {
            room = await prisma.chatRoom.create({
                data: { jobseekerId, employerId },
                include: {
                    jobseeker: { select: { id: true, fullName: true, profilePicture: true, role: true } },
                    employer: { select: { id: true, fullName: true, profilePicture: true, role: true, companyName: true } }
                }
            });
        }

        return room;
    },

    async getUserRooms(userId) {
        return await prisma.chatRoom.findMany({
            where: {
                OR: [
                    { jobseekerId: userId },
                    { employerId: userId }
                ]
            },
            include: {
                jobseeker: { select: { id: true, fullName: true, profilePicture: true, role: true } },
                employer: { select: { id: true, fullName: true, profilePicture: true, role: true, companyName: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    },

    async getRoomMessages(roomId) {
        return await prisma.chatMessage.findMany({
            where: { roomId },
            include: {
                sender: { select: { id: true, fullName: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
    },

    async createMessage(roomId, senderId, message) {
        // Also update the updatedAt timestamp of the chat room
        const [newMessage] = await prisma.$transaction([
            prisma.chatMessage.create({
                data: { roomId, senderId, message },
                include: {
                    sender: { select: { id: true, fullName: true, role: true } }
                }
            }),
            prisma.chatRoom.update({
                where: { id: roomId },
                data: { updatedAt: new Date() }
            })
        ]);
        return newMessage;
    },

    async getRoomById(roomId) {
        return await prisma.chatRoom.findUnique({
            where: { id: roomId }
        });
    }
};

module.exports = ChatModel;
