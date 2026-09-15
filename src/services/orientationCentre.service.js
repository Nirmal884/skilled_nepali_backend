const OrientationCentreModel = require('../models/orientationCentre.model');
const { uploadToS3 } = require('../utils/s3Uploader');

const OrientationCentreService = {
    async createOrientationCentre(data, files) {
        const {
            name,
            description,
            status,
            registrationNumber,
            email,
            phone,
            alternativePhone,
            website,
            address,
            city,
            district,
            province,
            postalCode,
            latitude,
            longitude,
            timing,
            features,
            isActive
        } = data;

        if (!name || !name.trim()) {
            throw new Error('Orientation centre name is required');
        }

        if (!phone || !phone.trim()) {
            throw new Error('Primary phone number is required');
        }

        if (!address || !address.trim()) {
            throw new Error('Address is required');
        }

        let logoUrl = '';
        if (files && files.logo && files.logo.length > 0) {
            const logoFile = files.logo[0];
            const uploaded = await uploadToS3(
                logoFile.buffer,
                logoFile.originalname,
                logoFile.mimetype,
                'orientation_centres'
            );
            logoUrl = uploaded?.Location || '';
        }

        // Parse features
        let parsedFeatures = [];
        if (features) {
            if (Array.isArray(features)) {
                parsedFeatures = features.map(f => String(f).trim()).filter(Boolean);
            } else if (typeof features === 'string') {
                try {
                    const parsed = JSON.parse(features);
                    if (Array.isArray(parsed)) {
                        parsedFeatures = parsed.map(f => String(f).trim()).filter(Boolean);
                    } else {
                        parsedFeatures = features.split(',').map(f => f.trim()).filter(Boolean);
                    }
                } catch {
                    parsedFeatures = features.split(',').map(f => f.trim()).filter(Boolean);
                }
            }
        }

        const createData = {
            name: name.trim(),
            description: description?.trim() || '',
            status: status?.trim() || 'Government Approved (DOFE)',
            registrationNumber: registrationNumber?.trim() || '',
            email: email?.trim() || '',
            phone: phone.trim(),
            alternativePhone: alternativePhone?.trim() || '',
            website: website?.trim() || '',
            address: address.trim(),
            city: city?.trim() || '',
            district: district?.trim() || '',
            province: province?.trim() || '',
            postalCode: postalCode?.trim() || '',
            latitude: latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(latitude) : null,
            longitude: longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(longitude) : null,
            timing: timing?.trim() || '',
            features: parsedFeatures,
            logo: logoUrl || (typeof data.logo === 'string' ? data.logo : ''),
            isActive: isActive === undefined ? true : (isActive === true || isActive === 'true')
        };

        return await OrientationCentreModel.create(createData);
    },

    async getAllOrientationCentresAdmin(query) {
        const { page, limit, search, status, isActive } = query;
        return await OrientationCentreModel.findAllAdmin({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            search: search || '',
            status: status || '',
            isActive
        });
    },

    async getOrientationCentresPublic(query) {
        const { page, limit, search, district, province, status } = query;
        return await OrientationCentreModel.findAllPublic({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 12,
            search: search || '',
            district: district || '',
            province: province || '',
            status: status || ''
        });
    },

    async getOrientationCentreById(id) {
        const centre = await OrientationCentreModel.findById(id);
        if (!centre) {
            throw new Error('Orientation centre not found');
        }
        return centre;
    },

    async updateOrientationCentre(id, data, files) {
        const existing = await OrientationCentreModel.findById(id);
        if (!existing) {
            throw new Error('Orientation centre not found');
        }

        const updateData = {};

        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description.trim();
        if (data.status !== undefined) updateData.status = data.status.trim();
        if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber.trim();
        if (data.email !== undefined) updateData.email = data.email.trim();
        if (data.phone !== undefined) updateData.phone = data.phone.trim();
        if (data.alternativePhone !== undefined) updateData.alternativePhone = data.alternativePhone.trim();
        if (data.website !== undefined) updateData.website = data.website.trim();
        if (data.address !== undefined) updateData.address = data.address.trim();
        if (data.city !== undefined) updateData.city = data.city.trim();
        if (data.district !== undefined) updateData.district = data.district.trim();
        if (data.province !== undefined) updateData.province = data.province.trim();
        if (data.postalCode !== undefined) updateData.postalCode = data.postalCode.trim();
        if (data.timing !== undefined) updateData.timing = data.timing.trim();

        if (data.latitude !== undefined) {
            updateData.latitude = data.latitude !== null && data.latitude !== '' ? parseFloat(data.latitude) : null;
        }
        if (data.longitude !== undefined) {
            updateData.longitude = data.longitude !== null && data.longitude !== '' ? parseFloat(data.longitude) : null;
        }

        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive === true || data.isActive === 'true';
        }

        if (data.features !== undefined) {
            if (Array.isArray(data.features)) {
                updateData.features = data.features.map(f => String(f).trim()).filter(Boolean);
            } else if (typeof data.features === 'string') {
                try {
                    const parsed = JSON.parse(data.features);
                    if (Array.isArray(parsed)) {
                        updateData.features = parsed.map(f => String(f).trim()).filter(Boolean);
                    } else {
                        updateData.features = data.features.split(',').map(f => f.trim()).filter(Boolean);
                    }
                } catch {
                    updateData.features = data.features.split(',').map(f => f.trim()).filter(Boolean);
                }
            }
        }

        if (files && files.logo && files.logo.length > 0) {
            const logoFile = files.logo[0];
            const uploaded = await uploadToS3(
                logoFile.buffer,
                logoFile.originalname,
                logoFile.mimetype,
                'orientation_centres'
            );
            updateData.logo = uploaded?.Location || null;
        } else if (data.logo !== undefined && typeof data.logo === 'string') {
            updateData.logo = data.logo;
        }

        return await OrientationCentreModel.update(id, updateData);
    },

    async deleteOrientationCentre(id) {
        const existing = await OrientationCentreModel.findById(id);
        if (!existing) {
            throw new Error('Orientation centre not found');
        }
        return await OrientationCentreModel.softDelete(id);
    }
};

module.exports = OrientationCentreService;
