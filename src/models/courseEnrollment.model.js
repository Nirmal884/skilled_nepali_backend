const prisma = require("../config/db");

const CourseEnrollmentModel = {
    async createEnrollment(data) {
        return await prisma.courseEnrollment.create({
            data
        });
    },

    async getEnrollmentById(id) {
        return await prisma.courseEnrollment.findUnique({
            where: { id },
            include: {
                course: true,
                user: true
            }
        });
    },

    async getEnrollmentsByUserId(userId, search) {

        const whereClause = {
            userId: userId
        }
        if (search) {
            whereClause.OR = [{
                course: { courseName: { contains: search } }
            }]
        }

        return await prisma.courseEnrollment.findMany({
            where: whereClause,
            include: {
                course: {
                    include: {
                        trainingCentre: {
                            select: {
                                centreName: true,
                                fullName: true,
                                isVerified: true
                            }
                        }
                    }
                }
            }
        });
    },

    async getEnrollmentsByCourseId(courseId) {
        return await prisma.courseEnrollment.findMany({
            where: { courseId },
            include: {
                user: true
            }
        });
    },

    async updateEnrollmentStatus(id, status) {
        return await prisma.courseEnrollment.update({
            where: { id },
            data: { status }
        });
    }
};

module.exports = CourseEnrollmentModel;
