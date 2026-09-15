const prisma = require('../config/db');

const OrientationCentreModel = {
    async create(data) {
        return await prisma.orientationCentre.create({
            data
        });
    },

    async findAllAdmin({ page = 1, limit = 10, search = '', status = '', isActive }) {
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { district: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { registrationNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status) {
            where.status = status;
        }

        if (isActive !== undefined && isActive !== null && isActive !== '') {
            where.isActive = isActive === true || isActive === 'true';
        }

        const [orientationCentres, totalCount] = await Promise.all([
            prisma.orientationCentre.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.orientationCentre.count({ where })
        ]);

        return {
            orientationCentres,
            totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1,
            currentPage: page,
            limit
        };
    },

    async findAllPublic({ page = 1, limit = 12, search = '', district = '', province = '', status = '' }) {
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            isActive: true
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { district: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { registrationNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (district) {
            where.district = { contains: district, mode: 'insensitive' };
        }

        if (province) {
            where.province = { contains: province, mode: 'insensitive' };
        }

        if (status) {
            where.status = status;
        }

        const [orientationCentres, totalCount] = await Promise.all([
            prisma.orientationCentre.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.orientationCentre.count({ where })
        ]);

        return {
            orientationCentres,
            totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1,
            currentPage: page,
            limit
        };
    },

    async findById(id) {
        return await prisma.orientationCentre.findFirst({
            where: {
                id,
                deletedAt: null
            }
        });
    },

    async update(id, data) {
        return await prisma.orientationCentre.update({
            where: { id },
            data
        });
    },

    async softDelete(id) {
        return await prisma.orientationCentre.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false
            }
        });
    }
};

module.exports = OrientationCentreModel;
