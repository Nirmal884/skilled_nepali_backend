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
    }
}

module.exports = UserController;