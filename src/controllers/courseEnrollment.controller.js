const CourseEnrollmentService = require("../services/courseEnrollment.service");

const CourseEnrollmentController = {
    async enrollInCourse(req, res) {
        try {
            const { userId, courseId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "userId is required"
                });
            }

            if (!courseId) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "courseId is required"
                });
            }

            const enrollment = await CourseEnrollmentService.enrollInCourse(userId, courseId);
            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: "Enrolled in course successfully",
                data: enrollment
            });
        } catch (error) {
            console.error("Error in enrollInCourse controller:", error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message || "Internal server error"
            });
        }
    },

    async getUserEnrollments(req, res) {
        try {
            const { userId } = req.params;
            const { search } = req.query;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "userId parameter is required"
                });
            }

            const enrollments = await CourseEnrollmentService.getUserEnrollments(userId, search);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User enrollments fetched successfully",
                data: enrollments
            });
        } catch (error) {
            console.error("Error in getUserEnrollments controller:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || "Internal server error"
            });
        }
    },

    async getCourseEnrollments(req, res) {
        try {
            const { courseId } = req.params;
            if (!courseId) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "courseId parameter is required"
                });
            }

            const enrollments = await CourseEnrollmentService.getCourseEnrollments(courseId);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Course enrollments fetched successfully",
                data: enrollments
            });
        } catch (error) {
            console.error("Error in getCourseEnrollments controller:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || "Internal server error"
            });
        }
    },

    async getCentreEnrollments(req, res) {
        try {
            const centreId = req.user.id;
            const { page, limit, search, status } = req.query;
            const { enrollments, count } = await CourseEnrollmentService.getCentreEnrollments(
                centreId,
                Number(page) || 1,
                Number(limit) || 10,
                search,
                status
            );
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Centre enrollments fetched successfully",
                data: enrollments,
                count: count
            });
        } catch (error) {
            console.error("Error in getCentreEnrollments controller:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || "Internal server error"
            });
        }
    },

    async updateEnrollmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "status is required"
                });
            }

            const enrollment = await CourseEnrollmentService.updateEnrollmentStatus(id, status);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: `Enrollment status updated to ${status} successfully`,
                data: enrollment
            });
        } catch (error) {
            console.error("Error in updateEnrollmentStatus controller:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || "Internal server error"
            });
        }
    },

    async manualEnrollInCourse(req, res) {
        try {
            const { studentUserId, courseId } = req.body;
            const centreId = req.user.id;

            if (!studentUserId) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "studentUserId is required"
                });
            }

            if (!courseId) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "courseId is required"
                });
            }

            const enrollment = await CourseEnrollmentService.manualEnrollInCourse(Number(studentUserId), courseId, centreId);
            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: "Student manually enrolled successfully",
                data: enrollment
            });
        } catch (error) {
            console.error("Error in manualEnrollInCourse controller:", error);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                statusCode: statusCode,
                message: error.message || "Internal server error"
            });
        }
    },

    async getAdminCourseEnrollments(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const { enrollments, count } = await CourseEnrollmentService.getAdminCourseEnrollments(
                Number(page) || 1,
                Number(limit) || 10,
                search,
                status
            );
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Admin course enrollments fetched successfully",
                data: enrollments,
                count: count
            });
        } catch (error) {
            console.error("Error in getAdminCourseEnrollments controller:", error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || "Internal server error"
            });
        }
    }
};

module.exports = CourseEnrollmentController;
