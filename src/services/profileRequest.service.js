const ProfileRequestModel = require("../models/profileRequest.model");
const ExcelJS = require('exceljs');

const ProfileRequestService = {
    async createProfileRequest(employerId, jobCategoryId, noOfCandidates) {
        if (!jobCategoryId) {
            throw new Error("Job category is required");
        }
        if (!noOfCandidates || noOfCandidates <= 0) {
            throw new Error("Number of candidates must be greater than zero");
        }
        return await ProfileRequestModel.createProfileRequest(employerId, jobCategoryId, noOfCandidates);
    },

    async getEmployerProfileRequests(employerId) {
        return await ProfileRequestModel.getEmployerProfileRequests(employerId);
    },

    async getAdminProfileRequests() {
        const requests = await ProfileRequestModel.getAdminProfileRequests();
        // Add matching candidate count to each request
        return await Promise.all(requests.map(async (req) => {
            const availableCandidates = await ProfileRequestModel.countMatchingCandidates(req.jobCategoryId);
            return {
                ...req,
                availableCandidates
            };
        }));
    },

    async updateProfileRequestStatus(id, status, adminNote) {
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            throw new Error("Invalid approval status");
        }
        return await ProfileRequestModel.updateProfileRequestStatus(id, status, adminNote);
    },

    async getApprovedRequestCandidates(id) {
        const request = await ProfileRequestModel.getProfileRequestById(id);
        if (!request) {
            throw new Error("Profile request not found");
        }
        if (request.status !== 'APPROVED') {
            throw new Error("Candidates can only be viewed for approved requests");
        }
        return await ProfileRequestModel.getMatchingCandidates(request.jobCategoryId, request.noOfCandidates);
    },

    async downloadApprovedRequestCandidatesExcel(id) {
        const candidates = await this.getApprovedRequestCandidates(id);
        const request = await ProfileRequestModel.getProfileRequestById(id);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Candidates');

        worksheet.columns = [
            { header: 'SL NO', key: 'sl', width: 10, alignment: { horizontal: 'center' } },
            { header: 'Name', key: 'fullName', width: 30 },
            { header: 'Job Title', key: 'title', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Skills Count', key: 'skillsCount', width: 15, alignment: { horizontal: 'center' } },
            { header: 'Experience (Years)', key: 'experience', width: 20, alignment: { horizontal: 'center' } },
            { header: 'Certifications Count', key: 'certsCount', width: 20, alignment: { horizontal: 'center' } },
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4f46e5' }
        };

        candidates.forEach((cand, index) => {
            worksheet.addRow({
                sl: index + 1,
                fullName: cand.fullName,
                title: cand.title || 'N/A',
                email: cand.email,
                phone: cand.phone || 'N/A',
                skillsCount: cand.skills?.length || 0,
                experience: cand.experience || 0,
                certsCount: cand.certifications?.length || 0
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, categoryName: request.jobCategory?.categoryName || 'candidates' };
    }
};

module.exports = ProfileRequestService;
