const ApplicantTypeModel = require("../models/applicantTypes.model")

const ApplicantTypeService = {
    async createApplicantType(data) {
        const existing = await ApplicantTypeModel.getApplicantTypeByName(data.applicantTypeName);
        if (existing) {
            throw new Error("Applicant type already exists");
        }
        const applicantType = await ApplicantTypeModel.createApplicantType(data);
        return { applicantType, message: "Applicant type created successfully" };
    },

    async getApplicantTypes(page, limit, search) {
        const { applicantType, count } = await ApplicantTypeModel.getApplicantTypes(Number(page), Number(limit), search);
        return { applicantType, message: "Applicant types fetched successfully", count };
    },


    async updateApplicantType(id, data) {
        const applicantType = await ApplicantTypeModel.updateApplicantType(id, data);
        return { applicantType, message: "Applicant type updated successfully" };
    },

    async deleteApplicantType(id) {
        const applicantType = await ApplicantTypeModel.deleteApplicantType(id);
        return { applicantType, message: "Applicant type deleted successfully" };
    },
}

module.exports = ApplicantTypeService;