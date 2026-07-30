const prisma = require("../config/db")

const AdminDashboardModel = {
    async getDashboardStats() {
        const [totalUsers, pendingJobs, deleteRequestedJobs, totalJobApplications, totalEmployers] = await prisma.$transaction([
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
            prisma.jobApplication.count(),
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
            totalJobApplications,
            totalEmployers
        }
    },

    async getUserGrowthGraphStats(period) {
        const now = new Date();
        let startDate, endDate, groupFormat, dateKey;

        if (period === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);

            groupFormat = 'DD';
            dateKey = 'date';

        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

            groupFormat = 'DD';
            dateKey = 'date';

        } else if (period === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);

            groupFormat = 'Mon';
            dateKey = 'month';

        } else {
            throw new Error('Invalid period');
        }

        const result = await prisma.$queryRawUnsafe(`
        SELECT
            "${dateKey}",
            COUNT("id")::int as "count"
        FROM (
            SELECT
                "id",
                TO_CHAR("createdAt", '${groupFormat}') as "${dateKey}",
                "createdAt"
            FROM "user_profiles"
            WHERE "createdAt" >= $1
              AND "createdAt" < $2
              AND "role" <> 'ADMIN'
              AND "deletedAt" IS NULL
        ) as sub
        GROUP BY "${dateKey}"
        ORDER BY MIN("createdAt")
    `, startDate, endDate);

        if (period === 'week') {
            const map = {};
            result.forEach(r => map[r.date] = r.count);

            const filled = [];
            const current = new Date(startDate);

            while (current <= now) {
                const d = String(current.getDate()).padStart(2, '0');
                filled.push({
                    date: d,
                    count: map[d] || 0
                });
                current.setDate(current.getDate() + 1);
            }

            return filled;
        }

        if (period === 'month') {
            const map = {};
            result.forEach(r => map[r.date] = r.count);

            const filled = [];
            const lastDay = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            ).getDate();

            for (let i = 1; i <= lastDay; i++) {
                const d = String(i).padStart(2, '0');
                filled.push({
                    date: d,
                    count: map[d] || 0
                });
            }

            return filled;
        }

        if (period === 'year') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const map = {};
            result.forEach(r => map[r.month] = r.count);

            return months.map(m => ({
                month: m,
                count: map[m] || 0
            }));
        }

        return result;
    },

    async getTotalApplicationsGraphStats(period) {
        const now = new Date();
        let startDate, endDate, groupFormat, dateKey, formatDate;

        if (period === 'week') {
            // Last 7 days
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);

            groupFormat = 'DD';
            dateKey = 'date';
            formatDate = (date) => String(date).padStart(2, '0');

        } else if (period === 'month') {
            // This calendar month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

            groupFormat = 'DD';
            dateKey = 'date';
            formatDate = (date) => String(date).padStart(2, '0');

        } else if (period === 'year') {
            // This calendar year
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);

            groupFormat = 'Mon';
            dateKey = 'month';
            formatDate = (date) => date;

        } else {
            throw new Error('Invalid period');
        }

        const result = await prisma.$queryRawUnsafe(`
        SELECT
            "${dateKey}",
            COUNT("id")::int as "count"
        FROM (
            SELECT
                "id",
                TO_CHAR("createdAt", '${groupFormat}') as "${dateKey}",
                "createdAt"
            FROM "job_applications"
            WHERE "createdAt" >= $1
              AND "createdAt" < $2
        ) as sub
        GROUP BY "${dateKey}"
        ORDER BY MIN("createdAt")
    `, startDate, endDate);

        // Fill missing days/months
        const filled = [];

        if (period === 'week') {
            const map = {};
            result.forEach(r => map[r.date] = r.count);

            const current = new Date(startDate);
            while (current <= now) {
                const d = formatDate(current.getDate());
                filled.push({
                    date: d,
                    count: map[d] || 0
                });
                current.setDate(current.getDate() + 1);
            }
        }

        if (period === 'month') {
            const map = {};
            result.forEach(r => map[r.date] = r.count);

            const lastDay = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            ).getDate();

            for (let i = 1; i <= lastDay; i++) {
                const d = formatDate(i);
                filled.push({
                    date: d,
                    count: map[d] || 0
                });
            }
        }

        if (period === 'year') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const map = {};
            result.forEach(r => map[r.month] = r.count);

            filled.push(...months.map(m => ({
                month: m,
                count: map[m] || 0
            })));
        }

        return filled;
    },

    async downloadUserExcel(role) {
        const [users, count] = await prisma.$transaction([
            prisma.user.findMany({
                where: {
                    deletedAt: null,
                    role: role,
                },
            }),
            prisma.user.count({
                where: {
                    deletedAt: null,
                    role: role
                }
            })
        ])

        const cleanedUsers = users.map(({ password, ...user }) => user);
        return { users: cleanedUsers, count }

    }

}

module.exports = AdminDashboardModel;