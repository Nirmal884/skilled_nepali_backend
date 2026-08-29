const express = require('express')
const cors = require('cors')
const http = require('http');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const ChatService = require('./services/chat.service')
const publicRoutes = require('./routes/publicRoutes')
const webhookRoutes = require('./routes/webhookRoutes')

const app = express();

const { Server } = require('socket.io');
const httpServer = http.createServer(app);

app.set('trust proxy', 1);

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://cms.kaamdaar.owlstip.com",
            "https://kaamdaar.owlstip.com"
        ],
        credentials: true
    })
)

app.use(
    '/api/v1/webhooks',
    express.raw({ type: 'application/json' }),
    webhookRoutes
);

app.use(express.json())
app.use(cookieParser())

const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://cms.kaamdaar.owlstip.com",
            "https://kaamdaar.owlstip.com"
        ],
        credentials: true
    }
});

// routes

app.use('/api/v1', publicRoutes)


app.get("/", (req, res) => {
    res.json({
        message: "Welcome to skilled nepali backend api"
    })
})

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK", message: "Server running..."
    })
})

// Middleware to authenticate socket connections
io.use((socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error('Authentication failed: No cookies sent'));
        }

        const cookies = {};
        cookieHeader.split(';').forEach(c => {
            const parts = c.split('=');
            if (parts.length === 2) {
                cookies[parts[0].trim()] = parts[1].trim();
            }
        });

        const token = cookies.token;
        if (!token) {
            return next(new Error('Authentication failed: Token not found'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
        socket.user = decoded;
        next();
    } catch (error) {
        console.error("Socket authentication error:", error.message);
        return next(new Error('Authentication failed: Invalid token'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`⚡ WebSocket connected: ${socket.id} (User: ${userId}, Role: ${socket.user.role})`);

    // Users join their personal room for custom/general real-time notifications
    socket.join(userId);

    // Joining a specific chat room
    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${userId} joined chat room ${chatId}`);
    });

    // Sending a message
    socket.on('send_message', async (data) => {
        const { chatId, message } = data;
        if (!chatId || !message) return;

        try {
            // Persist the message using ChatService
            const savedMessage = await ChatService.createMessage(chatId, userId, message);

            // Broadcast the saved message to everyone in the room
            io.to(chatId).emit('receive_message', savedMessage);

            // Fetch the room details to notify the other user (recipient)
            const room = await ChatService.getRoomById(chatId);
            if (room) {
                const recipientId = room.jobseekerId === userId ? room.employerId : room.jobseekerId;
                io.to(recipientId).emit('new_message_notification', {
                    chatId,
                    message: savedMessage
                });
            }
        } catch (error) {
            console.error("Error handling send_message socket event:", error);
            socket.emit('error', { message: "Failed to send message" });
        }
    });

    // Typing status
    socket.on('typing', (data) => {
        const { chatId, isTyping } = data;
        if (!chatId) return;
        socket.to(chatId).emit('user_typing', { chatId, userId, isTyping });
    });

    socket.on('disconnect', () => {
        console.log(`WebSocket disconnected: ${socket.id} (User: ${userId})`);
    });
})

module.exports = { app, httpServer, io };