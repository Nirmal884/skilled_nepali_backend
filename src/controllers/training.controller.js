const TrainingService = require('../services/training.service');

const TrainingController = {
    async createCourse(req, res) {
        try {
            const data = req.body;
            const files = req.files;
            const trainingCentreId = "0e3bfed1-2f4b-45e7-a56a-764130e298b3";

            const course = await TrainingService.createCourse(data, files, trainingCentreId);
            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: "Course created successfully",
                data: course
            });
        } catch (error) {
            console.error('Error creating course:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getAllCourses(req, res) {
        try {
            const { page, limit, search } = req.query;
            let trainingCentreId = req.query.trainingCentreId;
            if (req.user && req.user.role === 'TRAINING_CENTRE') {
                trainingCentreId = req.user.id;
            }
            const { courses, message, count } = await TrainingService.getAllCourses(Number(page), Number(limit), search, trainingCentreId);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: courses,
                count: count
            });
        } catch (error) {
            console.error('Error fetching courses:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getAllCoursesList(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const { courses, message, count } = await TrainingService.getAllCoursesList(Number(page), Number(limit), search, status);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: message,
                data: courses,
                count: count
            });
        } catch (error) {
            console.error('Error fetching courses:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async editSelectedCourse(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const files = req.files;
            const course = await TrainingService.editSelectedCourse(id, data, files);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Course updated successfully",
                data: course
            });
        } catch (error) {
            console.error('Error editing course:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async deleteCourse(req, res) {
        try {
            const { id } = req.params
            const course = await TrainingService.deleteCourse(id)
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Course deleted successfully",
                data: course
            });
        } catch (error) {
            console.error('Error deleting course:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async adminApproveCourse(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const course = await TrainingService.adminApproveCourse(id, status);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: `Course status updated to ${status || 'ACTIVE'} successfully`,
                data: course
            });
        } catch (error) {
            console.error('Error approving/denying course:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    }
}

module.exports = TrainingController;