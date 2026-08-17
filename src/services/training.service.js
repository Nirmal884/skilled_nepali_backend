const TrainingModel = require('../models/training.model');
const { uploadToS3 } = require('../utils/s3Uploader');

const TrainingService = {
    async createCourse(data, files, trainingCentreId) {
        const prisma = require('../config/db');
        const user = await prisma.user.findUnique({ where: { id: trainingCentreId } });
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.isAdminApproved) {
            throw new Error("Forbidden: Your account must be approved by the admin to publish courses");
        }
        const {
            courseName,
            description,
            duration,
            durationHours,
            level,
            isFree,
            price,
            seats,
            seatsLeft,
            isCertified,
            certBody,
            topics,
            mode,
            language,
            trainer,
            jobCategoryId,
        } = data;

        let imageUrl = null;
        let videoUrl = null;

        if (files) {
            if (files.image && files.image[0]) {
                const uploadedImage = await uploadToS3(
                    files.image[0].buffer,
                    files.image[0].originalname,
                    files.image[0].mimetype,
                    "courses/images"
                );
                imageUrl = uploadedImage.Location;
            }
            if (files.videoUrl && files.videoUrl[0]) {
                const uploadedVideo = await uploadToS3(
                    files.videoUrl[0].buffer,
                    files.videoUrl[0].originalname,
                    files.videoUrl[0].mimetype,
                    "courses/videos"
                );
                videoUrl = uploadedVideo.Location;
            }
        }

        const parsedIsFree = isFree === 'true' || isFree === true;
        const parsedIsCertified = isCertified === 'true' || isCertified === true;
        const parsedSeats = parseInt(seats, 10) || 0;
        const parsedSeatsLeft = seatsLeft ? parseInt(seatsLeft, 10) : parsedSeats;

        let parsedTopics = [];
        if (topics) {
            if (Array.isArray(topics)) {
                parsedTopics = topics;
            } else {
                try {
                    parsedTopics = JSON.parse(topics);
                } catch (e) {
                    parsedTopics = topics.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
        }

        const resolvedJobCategoryId = jobCategoryId || category;
        const resolvedTrainer = trainer;

        return await TrainingModel.createCourse({
            courseName,
            description,
            duration,
            durationHours: durationHours || null,
            level,
            isFree: parsedIsFree,
            price: parsedIsFree ? null : price,
            seats: parsedSeats,
            seatsLeft: parsedSeatsLeft,
            isCertified: parsedIsCertified,
            certBody: parsedIsCertified ? certBody : null,
            topics: parsedTopics,
            mode: mode || "ONLINE",
            language: language || null,
            image: imageUrl,
            videoUrl: videoUrl,
            trainer: resolvedTrainer,
            jobCategoryId: resolvedJobCategoryId,
            trainingCentreId
        });
    },

    async getAllCourses(page, limit, search, trainingCentreId) {
        const { courses, count } = await TrainingModel.getAllCourses(page, limit, search, trainingCentreId)
        return { courses, message: "Courses fetched successfully", count }
    },

    async getAllCoursesList(page, limit, search, status, filters) {
        const { courses, count } = await TrainingModel.getAllCoursesList(page, limit, search, status, filters)
        return { courses, message: "Courses fetched successfully", count }
    },

    async deleteCourse(id, user) {
        const course = await TrainingModel.getSingleCourseDetail(id);
        if (!course) {
            throw new Error("Course not found");
        }

        if (user && user.role === 'TRAINING_CENTRE') {
            if (course.trainingCentreId !== user.id) {
                throw new Error("Forbidden: You do not own this course");
            }

            if (course.status === 'ACTIVE') {
                const updatedCourse = await TrainingModel.requestCourseDeletion(id, "Requested by training centre");
                return {
                    course: updatedCourse,
                    message: "Course deletion request sent to admin for approval"
                };
            }
        }

        const deletedCourse = await TrainingModel.deleteCourse(id);
        return {
            course: deletedCourse,
            message: "Course deleted successfully"
        };
    },

    async editSelectedCourse(id, data, files) {
        const {
            courseName,
            description,
            duration,
            durationHours,
            level,
            isFree,
            price,
            seats,
            seatsLeft,
            isCertified,
            certBody,
            topics,
            mode,
            language,
            trainer,
            jobCategoryId,
        } = data;

        let imageUrl = undefined;
        let videoUrl = undefined;

        if (files) {
            if (files.image && files.image[0]) {
                const uploadedImage = await uploadToS3(
                    files.image[0].buffer,
                    files.image[0].originalname,
                    files.image[0].mimetype,
                    "courses/images"
                );
                imageUrl = uploadedImage.Location;
            }
            if (files.videoUrl && files.videoUrl[0]) {
                const uploadedVideo = await uploadToS3(
                    files.videoUrl[0].buffer,
                    files.videoUrl[0].originalname,
                    files.videoUrl[0].mimetype,
                    "courses/videos"
                );
                videoUrl = uploadedVideo.Location;
            }
        }

        const updateData = {
            ...(courseName && { courseName }),
            ...(description && { description }),
            ...(duration && { duration }),
            ...(durationHours !== undefined && { durationHours: durationHours || null }),
            ...(level && { level }),
            ...(isFree !== undefined && { isFree: isFree === 'true' || isFree === true }),
            ...(price !== undefined && { price: isFree === 'true' || isFree === true ? null : price }),
            ...(seats !== undefined && { seats: parseInt(seats, 10) || 0 }),
            ...(seatsLeft !== undefined && { seatsLeft: parseInt(seatsLeft, 10) || 0 }),
            ...(isCertified !== undefined && { isCertified: isCertified === 'true' || isCertified === true }),
            ...(certBody !== undefined && { certBody: certBody || null }),
            ...(mode && { mode }),
            ...(language !== undefined && { language: language || null }),
            ...(trainer && { trainer }),
            ...(jobCategoryId && { jobCategoryId }),
            ...(imageUrl && { image: imageUrl }),
            ...(videoUrl && { videoUrl })
        };

        if (topics) {
            let parsedTopics = [];
            if (Array.isArray(topics)) {
                parsedTopics = topics;
            } else {
                try {
                    parsedTopics = JSON.parse(topics);
                } catch (e) {
                    parsedTopics = topics.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
            updateData.topics = parsedTopics;
        }

        return await TrainingModel.updateCourse(id, updateData);
    },


    async adminApproveCourse(id, status) {
        return await TrainingModel.adminApproveCourse(id, status)
    },

    async getSingleCourseDetail(id) {
        return await TrainingModel.getSingleCourseDetail(id)
    },

    async getCoursesDropdown(search, trainingCentreId) {
        return await TrainingModel.getCoursesDropdown(search, trainingCentreId);
    },

    async listDeleteRequestedCourses(page, limit) {
        const { courses, totalCourses } = await TrainingModel.listDeleteRequestedCourses(page, limit);
        return {
            courses,
            totalCourses,
            message: "Delete requested courses fetched successfully"
        };
    }
}

module.exports = TrainingService