const prisma = require('../config/db');
const { groupedCountryOptions } = require('../data/countryData');


const JobCategoryModel = {
    async createJobCategory(data) {
        return await prisma.jobCategory.create({
            data,
        });
    },

    async getAllJobCategories(page, limit, search) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 10;
        
        const whereCondition = { deletedAt: null };
        if (search) {
            whereCondition.categoryName = {
                contains: search,
                mode: 'insensitive'
            };
        }

        const jobCategories = await prisma.jobCategory.findMany({
            skip,
            take,
            where: whereCondition,
            select: {
                id: true,
                categoryName: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const count = await prisma.jobCategory.count({ where: whereCondition });
        return { jobCategories, count };
    },

    async getJobCategoryByName(name) {
        return await prisma.jobCategory.findFirst({
            where: { categoryName: name, deletedAt: null },
        });
    },

    async updateJobCategory(id, data) {
        return await prisma.jobCategory.update({
            where: { id },
            data,
        });
    },

    async deleteJobCategory(id) {
        return await prisma.jobCategory.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    async getGroupedCountries() {
        return groupedCountryOptions;
    }

}

module.exports = JobCategoryModel;