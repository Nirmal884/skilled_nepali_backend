const AdminDashboardModel = require("../models/admin.model");

const AdminDashboardService = {
    async getAdminDashboardStats() {
        const { totalUsers, pendingJobs, deleteRequestedJobs, totalJobApplications, totalEmployers } = await AdminDashboardModel.getDashboardStats();
        return {
            totalUsers,
            pendingJobs,
            deleteRequestedJobs,
            totalJobApplications,
            totalEmployers,
            message: "Admin dashboard stats fetched successfully"
        }
    },

    async getUserGrowthGraphStats(period) {
        const stats = await AdminDashboardModel.getUserGrowthGraphStats(period);
        return {
            stats,
            message: "User growth graph stats fetched successfully"
        }
    },

    async getTotalApplicationsGraphStats(period) {
        const stats = await AdminDashboardModel.getTotalApplicationsGraphStats(period);
        return {
            stats,
            message: "Total applications graph stats fetched successfully"
        }
    }
}

module.exports = AdminDashboardService;