const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const publicRoutes = require('./routes/publicRoutes')


const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173"
        ],
        credentials: true
    })
)

app.use(express.json())
app.use(cookieParser())

// routes

app.use('/api/v1/public', publicRoutes)


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