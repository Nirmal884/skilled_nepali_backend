const ApplicantTypeService = require("../services/applicantType.service");

const ApplicantTypeController = {
    async createApplicantType(req, res) {
        try {
            const { applicantType, message } = await ApplicantTypeService.createApplicantType(req.body);
            res.status(201).json({ message, statusCode: 201 });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async getApplicantTypes(req, res) {
        try {
            const page = req.query.page
            const limit = req.query.limit
            const search = req.query.search
            const { applicantType, message, count } = await ApplicantTypeService.getApplicantTypes(page, limit, search);
            res.status(200).json({ message, statusCode: 200, data: applicantType, count });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async updateApplicantType(req, res) {
        try {
            const applicantType = await ApplicantTypeService.updateApplicantType(req.params.id, req.body);
            res.status(200).json(applicantType);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async deleteApplicantType(req, res) {
        try {
            const applicantType = await ApplicantTypeService.deleteApplicantType(req.params.id);
            res.status(200).json(applicantType);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
}

module.exports = ApplicantTypeController;