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

    async getAllCoursesList(page, limit, search, status, filters = {}) {

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

        if (filters.categoryName && filters.categoryName !== 'All') {
            whereClause.jobCategory = {
                categoryName: filters.categoryName
            };
        }

        if (filters.centreName && filters.centreName !== 'All Centers') {
            whereClause.trainingCentre = {
                centreName: filters.centreName
            };
        }

        if (filters.level && filters.level !== 'all') {
            whereClause.level = filters.level;
        }

        if (filters.isFree !== undefined && filters.isFree !== null && filters.isFree !== '') {
            whereClause.isFree = filters.isFree === 'true' || filters.isFree === true;
        }

        let orderByClause = { createdAt: 'desc' };
        if (filters.sortBy === 'price-free-first') {
            orderByClause = { isFree: 'desc' };
        } else if (filters.sortBy === 'seats') {
            orderByClause = { seatsLeft: 'desc' };
        }

        const [courses, count] = await prisma.$transaction([
            prisma.course.findMany({
                where: whereClause,
                orderBy: orderByClause,
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
                    image: true,
                    topics: true,
                    jobCategory: {
                        select: {
                            categoryName: true
                        }
                    },
                    trainingCentre: {
                        select: {
                            centreName: true,
                            fullName: true,
                            centreLogo: true
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
                        fullName: true,
                        centreLogo: true
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
                        fullName: true,
                        centreLogo: true
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

    async requestCourseDeletion(id, reason = "Requested deletion") {
        return await prisma.course.update({
            where: { id },
            data: {
                deletionReason: reason,
                deleteRequestedOn: new Date()
            }
        });
    },

    async adminApproveCourse(id, status = "ACTIVE") {
        const updateData = { status };
        if (status === "ACTIVE") {
            updateData.deletionReason = "";
            updateData.deleteRequestedOn = null;
        }
        return await prisma.course.update({
            where: { id },
            data: updateData
        })
    },

    async getSingleCourseDetail(id) {
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
                        fullName: true,
                        centreLogo: true
                    }
                }
            }
        })
    },

    async getCoursesDropdown(search, trainingCentreId) {
        const whereClause = {
            deletedAt: null,
            status: "ACTIVE"
        };
        if (trainingCentreId) {
            whereClause.trainingCentreId = trainingCentreId;
        }
        if (search) {
            whereClause.courseName = {
                contains: search,
                mode: 'insensitive'
            };
        }

        return await prisma.course.findMany({
            where: whereClause,
            select: {
                id: true,
                courseName: true
            },
            orderBy: {
                courseName: 'asc'
            },
            take: 100
        });
    },

    async listDeleteRequestedCourses(page, limit) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 10;

        const [courses, totalCourses] = await prisma.$transaction([
            prisma.course.findMany({
                where: {
                    deletedAt: null,
                    AND: [
                        { deletionReason: { not: null } },
                        { deletionReason: { not: "" } }
                    ]
                },
                skip,
                take,
                include: {
                    trainingCentre: {
                        select: {
                            centreName: true,
                            fullName: true
                        }
                    }
                },
                orderBy: {
                    deleteRequestedOn: 'desc'
                }
            }),
            prisma.course.count({
                where: {
                    deletedAt: null,
                    AND: [
                        { deletionReason: { not: null } },
                        { deletionReason: { not: "" } }
                    ]
                }
            })
        ]);

        return { courses, totalCourses };
    }
};

module.exports = TrainingModel;