const prisma = require("../config/db");
const CourseEnrollmentModel = require("../models/courseEnrollment.model");

const CourseEnrollmentService = {
    async enrollInCourse(userId, courseId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 440;
            throw error;
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 440;
            throw error;
        }

        if (course.status !== "ACTIVE") {
            const error = new Error("Course is not active for enrollment");
            error.statusCode = 400;
            throw error;
        }

        const existingEnrollment = await prisma.courseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        if (existingEnrollment) {
            const error = new Error("User is already enrolled in this course");
            error.statusCode = 400;
            throw error;
        }

        if (course.seatsLeft <= 0) {
            const error = new Error("No seats left in this course");
            error.statusCode = 400;
            throw error;
        }

        const result = await prisma.$transaction(async (tx) => {
            const enrollment = await tx.courseEnrollment.create({
                data: {
                    userId,
                    courseId,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone || "",
                    courseName: course.courseName,
                    status: "PENDING"
                }
            });

            await tx.course.update({
                where: { id: courseId },
                data: {
                    seatsLeft: {
                        decrement: 1
                    }
                }
            });

            return enrollment;
        });

        return result;
    },

    async getUserEnrollments(userId) {
        return await CourseEnrollmentModel.getEnrollmentsByUserId(userId);
    },

    async getCourseEnrollments(courseId) {
        return await CourseEnrollmentModel.getEnrollmentsByCourseId(courseId);
    },

    async getCentreEnrollments(centreId, page = 1, limit = 10, search, status) {
        const whereClause = {
            course: {
                trainingCentreId: centreId
            }
        };

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { courseName: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [enrollments, count] = await prisma.$transaction([
            prisma.courseEnrollment.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    course: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.courseEnrollment.count({
                where: whereClause
            })
        ]);

        return { enrollments, count };
    },

    async getAdminCourseEnrollments(page = 1, limit = 10, search, status) {
        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { courseName: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [enrollments, count] = await prisma.$transaction([
            prisma.courseEnrollment.findMany({
                where: whereClause,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    course: {
                        include: {
                            trainingCentre: {
                                select: {
                                    centreName: true,
                                    fullName: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.courseEnrollment.count({
                where: whereClause
            })
        ]);

        return { enrollments, count };
    },

    async updateEnrollmentStatus(id, status) {
        return await CourseEnrollmentModel.updateEnrollmentStatus(id, status);
    },

    async manualEnrollInCourse(studentUserId, courseId, centreId) {
        const user = await prisma.user.findFirst({
            where: { userId: studentUserId }
        });

        if (!user) {
            const error = new Error("Student with this ID not found");
            error.statusCode = 404;
            throw error;
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 440;
            throw error;
        }

        if (course.trainingCentreId !== centreId) {
            const error = new Error("Course does not belong to this training center");
            error.statusCode = 403;
            throw error;
        }

        if (course.status !== "ACTIVE") {
            const error = new Error("Course is not active for enrollment");
            error.statusCode = 400;
            throw error;
        }

        const existingEnrollment = await prisma.courseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        if (existingEnrollment) {
            const error = new Error("User is already enrolled in this course");
            error.statusCode = 400;
            throw error;
        }

        if (course.seatsLeft <= 0) {
            const error = new Error("No seats left in this course");
            error.statusCode = 400;
            throw error;
        }

        const result = await prisma.$transaction(async (tx) => {
            const enrollment = await tx.courseEnrollment.create({
                data: {
                    userId: user.id,
                    courseId,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone || "",
                    courseName: course.courseName,
                    status: "APPROVED"
                }
            });

            await tx.course.update({
                where: { id: courseId },
                data: {
                    seatsLeft: {
                        decrement: 1
                    }
                }
            });

            return enrollment;
        });

        return result;
    }
};

module.exports = CourseEnrollmentService;
