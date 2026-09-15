const OrientationCentreService = require('../services/orientationCentre.service');

const OrientationCentreController = {
    async createOrientationCentre(req, res) {
        try {
            const data = req.body;
            const files = req.files;

            const result = await OrientationCentreService.createOrientationCentre(data, files);
            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Orientation centre created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error creating orientation centre:', error);
            return res.status(error.message.includes('required') ? 400 : 500).json({
                success: false,
                statusCode: error.message.includes('required') ? 400 : 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getAllOrientationCentresAdmin(req, res) {
        try {
            const result = await OrientationCentreService.getAllOrientationCentresAdmin(req.query);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Orientation centres fetched successfully',
                data: result.orientationCentres,
                count: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                limit: result.limit
            });
        } catch (error) {
            console.error('Error fetching admin orientation centres:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getOrientationCentresPublic(req, res) {
        try {
            const result = await OrientationCentreService.getOrientationCentresPublic(req.query);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Orientation centres fetched successfully',
                data: result.orientationCentres,
                count: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                limit: result.limit
            });
        } catch (error) {
            console.error('Error fetching public orientation centres:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getOrientationCentreById(req, res) {
        try {
            const { id } = req.params;
            const result = await OrientationCentreService.getOrientationCentreById(id);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Orientation centre fetched successfully',
                data: result
            });
        } catch (error) {
            console.error('Error fetching orientation centre by ID:', error);
            const status = error.message === 'Orientation centre not found' ? 404 : 500;
            return res.status(status).json({
                success: false,
                statusCode: status,
                message: error.message || 'Internal server error'
            });
        }
    },

    async updateOrientationCentre(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const files = req.files;

            const result = await OrientationCentreService.updateOrientationCentre(id, data, files);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Orientation centre updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error updating orientation centre:', error);
            const status = error.message === 'Orientation centre not found' ? 404 : 500;
            return res.status(status).json({
                success: false,
                statusCode: status,
                message: error.message || 'Internal server error'
            });
        }
    },

    async deleteOrientationCentre(req, res) {
        try {
            const { id } = req.params;
            await OrientationCentreService.deleteOrientationCentre(id);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Orientation centre deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting orientation centre:', error);
            const status = error.message === 'Orientation centre not found' ? 404 : 500;
            return res.status(status).json({
                success: false,
                statusCode: status,
                message: error.message || 'Internal server error'
            });
        }
    }
};

module.exports = OrientationCentreController;
