const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const publicRoutes = require('./routes/publicRoutes')
const webhookRoutes = require('./routes/webhookRoutes')


const app = express();

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

module.exports = app;