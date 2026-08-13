const { countryOptions, gccCountryOptions } = require("../data/countryData");
const AdminDashboardModel = require("../models/admin.model");
const ExcelJS = require('exceljs');

const allCountries = [...countryOptions, ...gccCountryOptions];

const AdminDashboardService = {
    async getAdminDashboardStats() {
        const { totalUsers, pendingJobs, deleteRequestedJobs, totalJobApplications, totalEmployers, pendingCourses, totalCourses } = await AdminDashboardModel.getDashboardStats();
        return {
            totalUsers,
            pendingJobs,
            deleteRequestedJobs,
            totalJobApplications,
            totalEmployers,
            pendingCourses,
            totalCourses,
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
    },

    async dowloadUsersExcel(role) {

        const {
            users,
            count
        } = await AdminDashboardModel.downloadUserExcel(role);

        const countryLookup = new Map(allCountries.map(item => [item.value, item.label]));
        const isEmployer = role === 'EMPLOYER';

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');


        worksheet.columns = [
            { header: 'SI NO', key: 'sl', width: 10, alignment: { horizontal: 'center' } },
            { header: 'ID', key: 'id', width: 10, alignment: { horizontal: 'center' } },
            { header: 'Name', key: 'fullName', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            ...(isEmployer ? [
                { header: 'Company Name', key: 'companyName', width: 30 },
                { header: 'Designation', key: 'designation', width: 30 }
            ] : []),
            { header: 'Country', key: 'country', width: 30 },
            { header: 'Phone', key: 'phone', width: 30 },
            { header: 'Role', key: 'role', width: 30 },
            { header: 'Is Profile Complete', key: 'isProfileComplete', width: 30 },
            { header: 'Is Admin Approved', key: 'isAdminApproved', width: 30 },
            { header: 'Created At', key: 'createdAt', width: 30 },
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '499A13' },
            color: { argb: 'FFFFFF' },
        };



        users.forEach((user, index) => {
            worksheet.addRow({
                sl: index + 1,
                id: user.userId,
                fullName: user.fullName,
                email: user.email,
                ...(isEmployer ? {
                    companyName: user.companyName,
                    designation: user.designation
                } : {}),
                country: countryLookup.get(user.country) || 'Unknown',
                phone: user.phone,
                role: user.role,
                isProfileComplete: user.isProfileComplete,
                isAdminApproved: user.isAdminApproved,
                createdAt: new Date(user.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).toLowerCase()

            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return {
            buffer,
            count,
            message: "Users list fetched successfully"
        }
    }
}

module.exports = AdminDashboardService;