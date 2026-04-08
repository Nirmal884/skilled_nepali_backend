const prisma = require('../config/db');

const ApplicantTypeModel = {

    async createApplicantType(data) {
        const applicantType = await prisma.applicantType.create({
            data,
        })
        return applicantType;
    },

    async getApplicantTypes(page, limit, search) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 10;
        
        const whereCondition = { deletedAt: null };
        if (search) {
            whereCondition.applicantTypeName = {
                contains: search,
                mode: 'insensitive'
            };
        }

        const applicantType = await prisma.applicantType.findMany({
            take: take,
            skip: skip,
            where: whereCondition,
            select: {
                id: true,
                applicantTypeName: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        const count = await prisma.applicantType.count({ where: whereCondition });
        return { applicantType, count };
    },

    async getApplicantTypeByName(name) {
        const applicantType = await prisma.applicantType.findFirst({
            where: { applicantTypeName: name, deletedAt: null },
        })
        return applicantType;
    },

    async updateApplicantType(id, data) {
        const applicantType = await prisma.applicantType.update({
            where: { id },
            data,
        })
        return applicantType;
    },

    async deleteApplicantType(id) {
        const applicantType = await prisma.applicantType.update({
            where: { id },
            data: { deletedAt: new Date() },
        })
        return applicantType;
    },

}

module.exports = ApplicantTypeModel;