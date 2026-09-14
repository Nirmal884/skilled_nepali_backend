const MedicalCentreService = require('../services/medicalCentre.service');

const MedicalCentreController = {
    async createMedicalCentre(req, res) {
        try {
            const data = req.body;
            const files = req.files;

            const result = await MedicalCentreService.createMedicalCentre(data, files);
            return res.status(201).json({
                success: true,
                statusCode: 201,
                message: 'Medical centre created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error creating medical centre:', error);
            return res.status(error.message.includes('required') ? 400 : 500).json({
                success: false,
                statusCode: error.message.includes('required') ? 400 : 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getAllMedicalCentresAdmin(req, res) {
        try {
            const result = await MedicalCentreService.getAllMedicalCentresAdmin(req.query);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Medical centres fetched successfully',
                data: result.medicalCentres,
                count: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                limit: result.limit
            });
        } catch (error) {
            console.error('Error fetching admin medical centres:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getMedicalCentresPublic(req, res) {
        try {
            const result = await MedicalCentreService.getMedicalCentresPublic(req.query);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Medical centres fetched successfully',
                data: result.medicalCentres,
                count: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                limit: result.limit
            });
        } catch (error) {
            console.error('Error fetching public medical centres:', error);
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || 'Internal server error'
            });
        }
    },

    async getMedicalCentreById(req, res) {
        try {
            const { id } = req.params;
            const result = await MedicalCentreService.getMedicalCentreById(id);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Medical centre fetched successfully',
                data: result
            });
        } catch (error) {
            console.error('Error fetching medical centre by ID:', error);
            const status = error.message === 'Medical centre not found' ? 404 : 500;
            return res.status(status).json({
                success: false,
                statusCode: status,
                message: error.message || 'Internal server error'
            });
        }
    },

    async updateMedicalCentre(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const files = req.files;

            const result = await MedicalCentreService.updateMedicalCentre(id, data, files);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Medical centre updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error updating medical centre:', error);
            const status = error.message === 'Medical centre not found' ? 404 : 500;
            return res.status(status).json({
                success: false,
                statusCode: status,
                message: error.message || 'Internal server error'
            });
        }
    },

    async deleteMedicalCentre(req, res) {
        try {
            const { id } = req.params;
            await MedicalCentreService.deleteMedicalCentre(id);
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Medical centre deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting medical centre:', error);
            const status = error.message === 'Medical centre not found' ? 404 : 500;
            return res.status(status).json({
                success: false,
                statusCode: status,
                message: error.message || 'Internal server error'
            });
        }
    }
};

module.exports = MedicalCentreController;
