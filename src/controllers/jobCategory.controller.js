const JobCategoryService = require("../services/jobCategory.service");


const JobCategoryController = {
    async createJobCategory(req, res) {
        try {
            const data = req.body;
            const { jobCategory, message } = await JobCategoryService.createJobCategory(data);
            return res.status(201).json({ success: true, statusCode: 201, message: message, data: jobCategory });
        } catch (error) {
            console.error('Error creating job category:', error);
            return res.status(500).json({ success: false, statusCode: 500, message: 'Internal server error' });
        }
    },

    async getAllJobCategories(req, res) {
        try {
            const { page, limit, search } = req.query;
            const { jobCategories, message, count } = await JobCategoryService.getAllJobCategories(page, limit, search);
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: jobCategories, count: count });
        } catch (error) {
            console.error('Error fetching job categories:', error);
            return res.status(500).json({ success: false, statusCode: 500, message: 'Internal server error' });
        }
    },

    async getCountries(req, res) {
        try {
            const { countries, message } = await JobCategoryService.getGroupedCountries();
            return res.status(200).json({ success: true, statusCode: 200, message: message, data: countries });
        } catch (error) {
            console.error('Error fetching countries:', error);
            return res.status(500).json({ success: false, statusCode: 500, message: 'Internal server error' });
        }
    },

}

module.exports = JobCategoryController;