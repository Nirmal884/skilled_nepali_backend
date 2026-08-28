const ProfileRequestModel = require("../models/profileRequest.model");

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
        return await ProfileRequestModel.getAdminProfileRequests();
    },

    async updateProfileRequestStatus(id, status) {
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            throw new Error("Invalid approval status");
        }
        return await ProfileRequestModel.updateProfileRequestStatus(id, status);
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
    }
};

module.exports = ProfileRequestService;
