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
                    },
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                }
            }),
            prisma.course.count({ where: whereClause })
        ])

        const mappedCourses = courses.map(course => {
            const { _count, ...rest } = course;
            return {
                ...rest,
                enrolledCount: _count?.enrollments || 0
            };
        });

        return { courses: mappedCourses, count };
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
                            centreLogo: true,
                            isVerified: true
                        }
                    },
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                }
            }),
            prisma.course.count({ where: whereClause })
        ])

        const mappedCourses = courses.map(course => {
            const { _count, ...rest } = course;
            return {
                ...rest,
                enrolledCount: _count?.enrollments || 0
            };
        });

        return { courses: mappedCourses, count };
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
        return await prisma.course.findFirst({
            where: {
                id,
                deletedAt: null
            },
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
                        centreLogo: true,
                        isVerified: true,
                        trainingCentreProfile: {
                            select: {
                                centreName: true,
                                centreLogo: true
                            }
                        }
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
    },

    async getAllTrainingCentres(page = 1, limit = 12, search = '', filters = {}) {
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.max(1, parseInt(limit, 10) || 12);
        const skip = (pageNumber - 1) * pageSize;

        const whereClause = {
            role: 'TRAINING_CENTRE',
            deletedAt: null
        };

        const andConditions = [];

        if (search && search.trim()) {
            const s = search.trim();
            andConditions.push({
                OR: [
                    { centreName: { contains: s, mode: 'insensitive' } },
                    { fullName: { contains: s, mode: 'insensitive' } },
                    {
                        trainingCentreProfile: {
                            OR: [
                                { centreName: { contains: s, mode: 'insensitive' } },
                                { city: { contains: s, mode: 'insensitive' } },
                                { district: { contains: s, mode: 'insensitive' } },
                                { province: { contains: s, mode: 'insensitive' } },
                                { address: { contains: s, mode: 'insensitive' } },
                                { tagline: { contains: s, mode: 'insensitive' } }
                            ]
                        }
                    }
                ]
            });
        }

        if (filters.district && filters.district.trim()) {
            andConditions.push({
                trainingCentreProfile: {
                    district: { contains: filters.district.trim(), mode: 'insensitive' }
                }
            });
        }

        if (filters.province && filters.province.trim()) {
            andConditions.push({
                trainingCentreProfile: {
                    province: { contains: filters.province.trim(), mode: 'insensitive' }
                }
            });
        }

        if (filters.centreType && filters.centreType.trim()) {
            andConditions.push({
                trainingCentreProfile: {
                    centreType: filters.centreType.trim()
                }
            });
        }

        if (andConditions.length > 0) {
            whereClause.AND = andConditions;
        }

        const [centres, totalCount] = await prisma.$transaction([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    centreName: true,
                    centreLogo: true,
                    isVerified: true,
                    verificationStatus: true,
                    trainingCentreProfile: {
                        select: {
                            centreName: true,
                            tagline: true,
                            centreType: true,
                            city: true,
                            district: true,
                            province: true,
                            address: true,
                            centreLogo: true,
                            establishedYear: true
                        }
                    },
                    _count: {
                        select: {
                            courses: {
                                where: {
                                    status: 'ACTIVE',
                                    deletedAt: null
                                }
                            }
                        }
                    }
                }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        const totalPages = Math.ceil(totalCount / pageSize) || 1;

        const trainingCentres = centres.map(c => {
            const p = c.trainingCentreProfile;
            const placeParts = [p?.city, p?.district, p?.province].filter(Boolean);
            const locationStr = placeParts.length > 0 ? placeParts.join(', ') : (p?.address || 'Nepal');

            return {
                id: c.id,
                name: p?.centreName || c.centreName || 'Training Centre',
                tagline: p?.tagline || '',
                centreType: p?.centreType || 'VOCATIONAL_TECHNICAL',
                logo: p?.centreLogo || c.centreLogo || null,
                location: locationStr,
                city: p?.city || '',
                district: p?.district || '',
                province: p?.province || '',
                address: p?.address || '',
                establishedYear: p?.establishedYear || null,
                isVerified: c.isVerified,
                verificationStatus: c.verificationStatus,
                totalCourses: c._count?.courses || 0
            };
        });

        return {
            trainingCentres,
            totalCount,
            totalPages,
            currentPage: pageNumber,
            limit: pageSize
        };
    },

    async getTrainingCentreDetails(id) {
        const user = await prisma.user.findFirst({
            where: {
                id: id,
                role: 'TRAINING_CENTRE',
                deletedAt: null
            },
            select: {
                id: true,
                email: true,
                phone: true,
                fullName: true,
                centreName: true,
                centreLogo: true,
                isVerified: true,
                verificationStatus: true,
                createdAt: true,
                trainingCentreProfile: true,
                courses: {
                    where: {
                        status: 'ACTIVE',
                        deletedAt: null
                    },
                    take: 4,
                    select: {
                        id: true,
                        courseName: true,
                        description: true,
                        duration: true,
                        durationHours: true,
                        level: true,
                        isFree: true,
                        price: true,
                        seats: true,
                        seatsLeft: true,
                        isCertified: true,
                        certBody: true,
                        image: true,
                        mode: true,
                        language: true,
                        trainer: true,
                        jobCategory: {
                            select: {
                                id: true,
                                categoryName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) return null;

        const p = user.trainingCentreProfile;
        const placeParts = [p?.city, p?.district, p?.province].filter(Boolean);
        const locationStr = placeParts.length > 0 ? placeParts.join(', ') : (p?.address || 'Nepal');

        return {
            id: user.id,
            name: p?.centreName || user.centreName || user.fullName,
            tagline: p?.tagline || '',
            centreType: p?.centreType,
            registrationNumber: p?.registrationNumber || '',
            affiliationNumber: p?.affiliationNumber || '',
            establishedYear: p?.establishedYear || null,

            contactPerson: p?.contactPerson || user.fullName || '',
            contactDesignation: p?.contactDesignation,
            officialEmail: p?.officialEmail || user.email || '',
            primaryPhone: p?.primaryPhone || user.phone || '',
            alternativePhone: p?.alternativePhone || '',
            website: p?.website || '',
            facebookUrl: p?.facebookUrl || '',
            linkedinUrl: p?.linkedinUrl || '',
            youtubeUrl: p?.youtubeUrl || '',

            address: p?.address || '',
            city: p?.city || '',
            district: p?.district || '',
            province: p?.province || '',
            postalCode: p?.postalCode || '',
            location: locationStr,

            latitude: p?.latitude || null,
            longitude: p?.longitude || null,

            about: p?.about || '',
            facilities: p?.facilities || [],
            specializations: p?.specializations || [],
            operatingHours: p?.operatingHours || '',

            logo: p?.centreLogo || user.centreLogo || null,
            coverImage: p?.coverImage || null,

            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            totalCourses: user.courses?.length || 0,
            courses: user.courses || []
        };
    }
};

module.exports = TrainingModel;