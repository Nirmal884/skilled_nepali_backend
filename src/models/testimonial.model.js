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

    async getApprovedTestimonials(page, limit, role) {
        const [testimonials, count] = await prisma.$transaction([
            prisma.testimonial.findMany({
                where: {
                    deletedAt: null,
                    status: 'APPROVED',
                    role: role
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
                    role: role
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

    async addEnquiry(data) {
        const enquiry = await prisma.enquiry.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                subject: data.subject,
                enquiry: data.enquiry,
            }
        })
        return enquiry;
    },

    async getEnquiries(page, limit, search, subject) {
        const whereClause = {
            deletedAt: null,
            ...(search && search.trim() !== "" && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ]
            }),
            ...(subject && subject.trim() !== "" && subject !== "ALL" && {
                subject: subject
            })
        };
        const [enquiries, count] = await prisma.$transaction([
            prisma.enquiry.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.enquiry.count({
                where: whereClause,
            })
        ]);
        return { enquiries, count };
    },




};

module.exports = TestimonialModel;