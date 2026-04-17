const AdminDashboardModel = require("../models/admin.model");

const AdminDashboardService = {
    async getAdminDashboardStats() {
        const { totalUsers, pendingJobs, deleteRequestedJobs, totalEmployers } = await AdminDashboardModel.getDashboardStats();
        return {
            totalUsers,
            pendingJobs,
            deleteRequestedJobs,
            totalEmployers,
            message: "Admin dashboard stats fetched successfully"
        }
    }
}

module.exports = AdminDashboardService;