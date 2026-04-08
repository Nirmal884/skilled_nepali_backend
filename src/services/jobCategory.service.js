const JobCategoryModel = require("../models/jobCategory.model");

const JobCategoryService = {
    async createJobCategory(data) {
        const existing = await JobCategoryModel.getJobCategoryByName(data.categoryName);
        if (existing) {
            throw new Error('Job category already exists');
        }
        const jobCategory = await JobCategoryModel.createJobCategory(data);
        return { jobCategory, message: 'Job category created successfully' };
    },

    async getAllJobCategories(page, limit, search) {
        const { jobCategories, count } = await JobCategoryModel.getAllJobCategories(Number(page), Number(limit), search);
        return { jobCategories, message: 'Job categories fetched successfully', count: count };
    },

    async getGroupedCountries() {
        const countries = await JobCategoryModel.getGroupedCountries();
        return { countries, message: 'Countries fetched successfully' };
    }
}

module.exports = JobCategoryService;