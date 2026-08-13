const AdminDashboardService = require("../services/admin.service");

const AdminDashboardController = {
    async getAdminDashboardStats(req, res) {
        try {
            const { totalUsers, pendingJobs, deleteRequestedJobs, totalJobApplications, totalEmployers, pendingCourses, totalCourses, message } = await AdminDashboardService.getAdminDashboardStats();
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: { totalUsers, pendingJobs, deleteRequestedJobs, totalJobApplications, totalEmployers, pendingCourses, totalCourses }
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
    },

    async getUserGrowthGraphStats(req, res) {
        try {
            const { period } = req.query;
            const stats = await AdminDashboardService.getUserGrowthGraphStats(period);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User growth graph stats fetched successfully",
                data: stats
            });
        } catch (error) {
            console.error('Error fetching user growth graph stats:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: statusCode === 500 ? "Internal Server Error" : error.message
            });
        }
    },

    async getTotalApplicationsGraphStats(req, res) {
        try {
            const { period } = req.query;
            const stats = await AdminDashboardService.getTotalApplicationsGraphStats(period);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Total applications graph stats fetched successfully",
                data: stats
            });
        } catch (error) {
            console.error('Error fetching total applications graph stats:', error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: statusCode === 500 ? "Internal Server Error" : error.message
            });
        }
    },

    async downloadUsersExcel(req, res) {
        try {

            const { role } = req.query;

            const { buffer, count, message } = await AdminDashboardService.dowloadUsersExcel(role);

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=users-list.xlsx'
            );

            return res.status(200).send(buffer);
        } catch (error) {
            console.error('Error fetching users excel:', error);
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