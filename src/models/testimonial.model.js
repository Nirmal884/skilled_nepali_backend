const prisma = require('../config/db');

const TestimonialModel = {
    async addTestimonial(data) {
        const testimonial = await prisma.testimonial.create({
            data: {
                name: data.name,
                role: data.role,
                country: data.country,
                position: data.position,
                quote: data.quote,
                rating: data.rating,
            },
        });
        return testimonial;
    },

    async getApprovedTestimonials(page, limit) {
        const [testimonials, count] = await prisma.$transaction([
            prisma.testimonial.findMany({
                where: {
                    deletedAt: null,
                    status: 'APPROVED',
                },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    country: true,
                    position: true,
                    quote: true,
                    rating: true,
                    status: false,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.testimonial.count({
                where: {
                    deletedAt: null,
                    status: 'APPROVED',
                },
            })
        ]);
        return { testimonials, count };
    },

    async updateStatus(id, status) {
        return await prisma.testimonial.update({
            where: { id },
            data: { status }
        });
    },

    async getAllTestimonials(page, limit, search) {
        const whereClause = {
            deletedAt: null,
            ...(search && search.trim() !== "" && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { position: { contains: search, mode: "insensitive" } }
                ]
            })
        };
        const [testimonials, count] = await prisma.$transaction([
            prisma.testimonial.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.testimonial.count({
                where: whereClause,
            })
        ]);
        return { testimonials, count };
    },


};

module.exports = TestimonialModel;