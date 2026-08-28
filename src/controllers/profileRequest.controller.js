const ProfileRequestService = require("../services/profileRequest.service");

const ProfileRequestController = {
    async createProfileRequest(req, res) {
        try {
            const employerId = req.user.id;
            const { jobCategoryId, noOfCandidates } = req.body;
            const result = await ProfileRequestService.createProfileRequest(employerId, jobCategoryId, noOfCandidates);
            return res.status(201).json({
                success: true,
                message: "Profile request submitted successfully",
                data: result
            });
        } catch (error) {
            console.error("Error creating profile request:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to create profile request"
            });
        }
    },

    async getEmployerProfileRequests(req, res) {
        try {
            const employerId = req.user.id;
            const result = await ProfileRequestService.getEmployerProfileRequests(employerId);
            return res.status(200).json({
                success: true,
                message: "Employer profile requests fetched successfully",
                data: result
            });
        } catch (error) {
            console.error("Error fetching employer profile requests:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch profile requests"
            });
        }
    },

    async getAdminProfileRequests(req, res) {
        try {
            const result = await ProfileRequestService.getAdminProfileRequests();
            return res.status(200).json({
                success: true,
                message: "Admin profile requests fetched successfully",
                data: result
            });
        } catch (error) {
            console.error("Error fetching admin profile requests:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch profile requests"
            });
        }
    },

    async updateProfileRequestStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await ProfileRequestService.updateProfileRequestStatus(id, status);
            return res.status(200).json({
                success: true,
                message: `Profile request status updated to ${status}`,
                data: result
            });
        } catch (error) {
            console.error("Error updating profile request status:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update profile request status"
            });
        }
    },

    async getApprovedRequestCandidates(req, res) {
        try {
            const { id } = req.params;
            const result = await ProfileRequestService.getApprovedRequestCandidates(id);
            return res.status(200).json({
                success: true,
                message: "Candidates fetched successfully",
                data: result
            });
        } catch (error) {
            console.error("Error fetching request candidates:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to fetch candidates"
            });
        }
    }
};

module.exports = ProfileRequestController;
