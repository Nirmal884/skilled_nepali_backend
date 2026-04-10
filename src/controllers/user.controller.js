const UserService = require("../services/user.service");

const UserController = {
    async createUser(req, res) {
        try {
            const data = req.body;
            const files = req.files;
            const { userData, message } = await UserService.createUser(data, files);
            return res.status(201).json({ success: true, statusCode: 201, message: message, data: userData });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ success: false, statusCode: 500, message: 'Internal server error' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { message, token, user } = await UserService.login(email, password);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: { token, user } });
        } catch (error) {
            console.error('Error logging in:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    }
}

module.exports = UserController;