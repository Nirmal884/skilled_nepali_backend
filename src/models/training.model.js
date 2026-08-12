const prisma = require("../config/db")

const TrainingModel = {
    async createCourse(data) {
        return await prisma.course.create({
            data
        })
    },

    async getAllCourses(page, limit, search, trainingCentreId) {

        const whereClause = {
            deletedAt: null
        }
        if (trainingCentreId) {
            whereClause.trainingCentreId = trainingCentreId;
        }
        if (search) {
            whereClause.OR = [
                { courseName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { language: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [courses, count] = await prisma.$transaction([
            prisma.course.findMany({
                where: whereClause,
                skip: page && (page - 1) * limit,

                take: limit && limit,
                include: {
                    jobCategory: {
                        select: {
                            categoryName: true
                        }
                    },
                    trainingCentre: {
                        select: {
                            centreName: true,
                            fullName: true
                        }
                    }
                }
            }),
            prisma.course.count({ where: whereClause })
        ])

        return { courses, count };
    },

    async getAllCoursesList(page, limit, search, status) {

        const whereClause = {
            deletedAt: null,
            status: status
        }
        if (search) {
            whereClause.OR = [
                { courseName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { language: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [courses, count] = await prisma.$transaction([
            prisma.course.findMany({
                where: whereClause,
                skip: page && (page - 1) * limit,
                take: limit && limit,
                select: {
                    id: true,
                    courseName: true,
                    duration: true,
                    durationHours: true,
                    level: true,
                    isFree: true,
                    price: true,
                    seats: true,
                    seatsLeft: true,
                    mode: true,
                    status: true,
                    isCertified: true,
                    certBody: true,
                    jobCategory: {
                        select: {
                            categoryName: true
                        }
                    },
                    trainingCentre: {
                        select: {
                            centreName: true,
                            fullName: true
                        }
                    }
                }
            }),
            prisma.course.count({ where: whereClause })
        ])

        return { courses, count };
    },

    async editSelectedCourse(id) {
        return await prisma.course.findUnique({
            where: { id },
            include: {
                jobCategory: {
                    select: {
                        categoryName: true
                    }
                },
                trainingCentre: {
                    select: {
                        centreName: true,
                        fullName: true
                    }
                }
            }
        })
    },

    async updateCourse(id, data) {
        return await prisma.course.update({
            where: { id },
            data,
            include: {
                jobCategory: {
                    select: {
                        categoryName: true
                    }
                },
                trainingCentre: {
                    select: {
                        centreName: true,
                        fullName: true
                    }
                }
            }
        });
    },

    async deleteCourse(id) {
        return await prisma.course.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: "DELETED"
            }
        })
    },

    async adminApproveCourse(id, status = "ACTIVE") {
        return await prisma.course.update({
            where: { id },
            data: {
                status: status
            }
        })
    },

}

module.exports = TrainingModel;