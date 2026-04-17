const AdminDashboardService = require("../services/admin.service");

const AdminDashboardController = {
    async getAdminDashboardStats(req, res) {
        try {
            const { totalUsers, pendingJobs, deleteRequestedJobs, totalEmployers, message } = await AdminDashboardService.getAdminDashboardStats();
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: { totalUsers, pendingJobs, deleteRequestedJobs, totalEmployers }
            });
        } catch (error) {
            console.error('Error fetching admin dashboard stats:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: statusCode === 500 ? "Internal Server Error" : error.message
            });
        }
    }
}

module.exports = AdminDashboardController;