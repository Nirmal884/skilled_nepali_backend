const prisma = require("../config/db")

const AdminDashboardModel = {
    async getDashboardStats() {
        const [totalUsers, pendingJobs, deleteRequestedJobs, totalEmployers] = await prisma.$transaction([
            prisma.user.count({
                where: {
                    role: "JOBSEEKER",
                    deletedAt: null
                }
            }),
            prisma.jobs.count({
                where: {
                    adminApprovalStatus: "PENDING",
                    deletedAt: null,
                    OR: [
                        { deletionReason: "" },
                        { deletionReason: null }
                    ]
                }
            }),
            prisma.jobs.count({
                where: {
                    deletedAt: null,
                    AND: [
                        { deletionReason: { not: null } },
                        { deletionReason: { not: "" } }
                    ]
                }
            }),
            prisma.user.count({
                where: {
                    deletedAt: null,
                    role: "EMPLOYER",
                    isAdminApproved: true
                }
            })
        ])
        return {
            totalUsers,
            pendingJobs,
            deleteRequestedJobs,
            totalEmployers
        }
    }
}

module.exports = AdminDashboardModel;