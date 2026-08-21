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

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax', // Use Lax for localhost cross-port
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            return res.status(200).json({ success: true, statusCode: 200, message: message, data: { user } });
        } catch (error) {
            console.error('Error logging in:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async logout(req, res) {
        res.clearCookie('token');
        return res.status(200).json({ success: true, statusCode: 200, message: "Successfully logged out" });
    },

    async sendOtpForPasswordChange(req, res) {
        try {
            const { number } = req.body;
            const { message } = await UserService.sendOtpForPasswordChange(number);
            return res.status(200).json({ success: true, statusCode: 200, message: message });
        } catch (error) {
            console.error('Error sending OTP for password change:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async verifyOtpForPasswordChange(req, res) {
        try {
            const { number, otp } = req.body;
            const { updatedUser, message } = await UserService.verifyOtpForPasswordChange(number, otp);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: updatedUser });
        } catch (error) {
            console.error('Error verifying OTP for password change:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async changePassword(req, res) {
        try {
            const { userId, password } = req.body;
            const { updatedUser, message } = await UserService.changePassword(userId, password);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: updatedUser });
        } catch (error) {
            console.error('Error changing password:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async updateResume(req, res) {
        try {
            const userId = req.user.id;
            const files = req.files;
            const { updatedUser, message } = await UserService.updateResume(userId, files)
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: message
            })
        } catch (error) {
            console.log("Error:", error)
            return res.status(500).json({
                success: false,
                message: error?.message || "Internal server error"
            })
        }
    },

    async getAllUsers(req, res) {
        try {
            const { role, search, page, limit } = req.query;
            const { users, count, message } = await UserService.getAllUsers(role, search, page, limit);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: { users, count } });
        } catch (error) {
            console.error('Error fetching users:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async deleteUser(req, res) {
        try {
            const { id: userId } = req.params;
            const { deletedUser, message } = await UserService.deleteUser(userId);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: deletedUser });
        } catch (error) {
            console.error('Error deleting user:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async updateLogo(req, res) {
        try {
            const { id: userId, role } = req.user;
            const files = req.files;
            const { updatedUser, message } = await UserService.updateLogo(userId, role, files);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: updatedUser });
        } catch (error) {
            console.error('Error updating logo:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async getMe(req, res) {
        try {
            const userData = req.user;
            const result = await UserService.getUserProfile(userData.id);
            if (result && result.user) {
                result.user.isImpersonated = !!userData.isImpersonated;
                result.user.impersonatedBy = userData.impersonatedBy || null;
            }
            return res.status(200).json({ success: true, statusCode: 200, data: result });
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ success: false, statusCode: 500, message: 'Internal server error' });
        }
    },

    async generateToken(req, res) {
        try {

        } catch (error) {
            console.log("Error occoured", error)
            const statusCode = error.statusCode || 500
            return res.status(statusCode).json({
                success: false, statusCode: statusCode, message: error.message
            })
        }
    },

    async verifyPhone(req, res) {
        try {
            const { phone } = req.body;
            const { message, user } = await UserService.verifyPhone(phone);
            return res.status(200).json({ success: true, statusCode: 201, message: message, data: user });
        } catch (error) {
            console.error('Error verifying phone:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async getUserProfile(req, res) {
        try {
            const { id: userId } = req.params;
            const { user, message } = await UserService.getUserProfile(userId);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: user
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async updateProfile(req, res) {
        try {
            const { id: userId } = req.params;
            const data = req.body;
            const { updatedUser, message } = await UserService.updateProfile(userId, data);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async createOrUpdateExperience(req, res) {
        try {
            const { id: userId } = req.params;
            const data = req.body;
            const { experience, message } = await UserService.createOrUpdateExperience(userId, data);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: experience
            });
        } catch (error) {
            console.error('Error creating or updating experience:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async deleteExperience(req, res) {
        try {
            const { id: experienceId } = req.params;
            const { deletedExperience, message } = await UserService.deleteExperience(experienceId);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: deletedExperience
            });
        } catch (error) {
            console.error('Error deleting experience:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async createOrUpdateEducation(req, res) {
        try {
            const { id: userId } = req.params;
            const data = req.body;
            const { education, message } = await UserService.createOrUpdateEducation(userId, data);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: education
            });
        } catch (error) {
            console.error('Error creating or updating education:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async deleteEducation(req, res) {
        try {
            const { id: educationId } = req.params;
            const { deletedEducation, message } = await UserService.deleteEducation(educationId);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: deletedEducation
            });
        } catch (error) {
            console.error('Error deleting education:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async createOrUpdateCertification(req, res) {
        try {
            const { id: userId } = req.params;
            const data = req.body;
            const { certification, message } = await UserService.createOrUpdateCertification(userId, data);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: certification
            });
        } catch (error) {
            console.error('Error creating or updating certification:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async deleteCertification(req, res) {
        try {
            const { id: certificationId } = req.params;
            const { deletedCertification, message } = await UserService.deleteCertification(certificationId);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: deletedCertification
            });
        } catch (error) {
            console.error('Error deleting certification:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async listAllUsersForDropdown(req, res) {
        try {
            const { page, limit, role } = req.query;
            const { users, count, message } = await UserService.listAllUsersForDropdown(Number(page), Number(limit), role);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: { users, count }
            });
        } catch (error) {
            console.error('Error fetching users for dropdown:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async uploadBusinessDocument(req, res) {
        try {
            const { id: userId } = req.user;
            const files = req.files;
            const { updatedUser, message } = await UserService.uploadBusinessDocument(userId, files);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: updatedUser });
        } catch (error) {
            console.error('Error uploading business document:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({ success: false, statusCode: statusCode, message: error.message });
        }
    },

    async adminVerifyUser(req, res) {
        try {
            const { id } = req.params;
            const { isAdminApproved, verificationStatus } = req.body;
            const updatedUser = await UserService.adminVerifyUser(id, { isAdminApproved, verificationStatus });
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User verification status updated successfully",
                data: updatedUser
            });
        } catch (error) {
            console.error('Error in adminVerifyUser:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    },

    async clearResume(req, res) {
        try {
            const { id: userId } = req.user;
            const { message } = await UserService.clearResume(userId);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message
            });
        } catch (error) {
            console.error('Error clearing resume:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message
            });
        }
    }
}

module.exports = UserController;