const UserModel = require("../models/user.model");
const { uploadToS3 } = require("../utils/s3Uploader");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const TokenService = require("./token.service");
const { getPlanLimitsForUser } = require("../utils/featureMatrix");

const UserService = {
    async createUser(data, files) {

        const existingUser = await UserModel.findUserByEmail(data.email)
        if (existingUser) {
            throw new Error("User already exists")
        }

        // Hash password
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        if (data.country) {
            data.country = parseInt(data.country);
        }
        if (data.experience) {
            data.experience = parseFloat(data.experience);
        }

        if (files) {
            if (files.resume) {
                const uploadedResume = await uploadToS3(files.resume[0].buffer, files.resume[0].originalname, files.resume[0].mimetype, "documents");
                data.resume = uploadedResume.Location;
            }
            if (files.companyLogo) {
                const uploadedCompanyLogo = await uploadToS3(files.companyLogo[0].buffer, files.companyLogo[0].originalname, files.companyLogo[0].mimetype, "images");
                data.companyLogo = uploadedCompanyLogo.Location;
            }
            if (files.centreLogo) {
                const uploadedCentreLogo = await uploadToS3(files.centreLogo[0].buffer, files.centreLogo[0].originalname, files.centreLogo[0].mimetype, "images");
                data.centreLogo = uploadedCentreLogo.Location;
            }
        }

        const userData = await UserModel.createUser(data)
        return { userData, message: "User created successfully" };
    },
    async login(email, passowrd, { userAgent = '', ipAddress = '' } = {}) {

        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            const error = new Error('Invalid Credentials')
            error.statusCode = 401;
            throw error;
        }

        const isPasswordMatch = await bcrypt.compare(passowrd, user.password);
        if (!isPasswordMatch) {
            const error = new Error("Invalid Credentials")
            error.statusCode = 401;
            throw error
        }

        const {
            accessToken,
            rawRefreshToken,
            accessCookieOptions,
            refreshCookieOptions
        } = await TokenService.generateTokens(user, { userAgent, ipAddress });

        return ({
            message: "Successfully logged in",
            token: accessToken,
            accessToken,
            rawRefreshToken,
            accessCookieOptions,
            refreshCookieOptions,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.fullName,
                companyName: user.companyName,
                companyLogo: user.companyLogo,
                centreName: user.centreName,
                centreLogo: user.centreLogo,
                resume: user.resume
            }
        })

    },

    async sendOtpForPasswordChange(number) {
        const updatedUser = await UserModel.sendOtpForPasswordChange(number);
        return { updatedUser, message: "OTP sent successfully" };
    },

    async verifyOtpForPasswordChange(number, otp) {
        const updatedUser = await UserModel.verifyOtpForPasswordChange(number, otp);
        return { updatedUser, message: "OTP verified successfully" };
    },

    async changePassword(userId, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await UserModel.changePassword(userId, hashedPassword);
        await TokenService.revokeAllUserTokens(userId);
        return { updatedUser, message: "Password changed successfully" };
    },

    async updateLogo(userId, role, files) {
        if (files.companyLogo) {
            const uploadedLogo = await uploadToS3(files.companyLogo[0].buffer, files.companyLogo[0].originalname, files.companyLogo[0].mimetype, "images");
            const updatedUser = await UserModel.updateLogo(userId, role, uploadedLogo.Location);
            return { updatedUser, message: "Logo updated successfully" };
        }
        if (files.centreLogo) {
            const uploadedLogo = await uploadToS3(files.centreLogo[0].buffer, files.centreLogo[0].originalname, files.centreLogo[0].mimetype, "images");
            const updatedUser = await UserModel.updateLogo(userId, role, uploadedLogo.Location);
            return { updatedUser, message: "Logo updated successfully" };
        }
        if (files.profilePicture) {
            const uploadedPic = await uploadToS3(files.profilePicture[0].buffer, files.profilePicture[0].originalname, files.profilePicture[0].mimetype, "images");
            const updatedUser = await UserModel.updateLogo(userId, role, uploadedPic.Location);
            return { updatedUser, message: "Profile picture updated successfully" };
        }
    },

    async updateResume(userId, files) {
        if (files.resume) {
            const uploadedResume = await uploadToS3(files.resume[0].buffer, files.resume[0].originalname, files.resume[0].mimetype, "documents");
            const updatedUser = await UserModel.updateResume(userId, uploadedResume.Location);
            return { updatedUser, message: "Resume updated successfully" };
        }
        throw new Error("Resume file is required");
    },

    async getAllUsers(role, search, page, limit) {
        const { users, count } = await UserModel.getAllUsers(role, search, Number(page), Number(limit));
        return { users, count, message: "Users fetched successfully" };
    },

    async deleteUser(userId) {
        const deletedUser = await UserModel.deleteUser(userId);
        await TokenService.revokeAllUserTokens(userId);
        return { deletedUser, message: "User deleted successfully" };
    },

    async verifyPhone(phone) {
        const user = await UserModel.verifyPhone(phone);
        if (!user) {
            const error = new Error("User not found")
            error.statusCode = 404;
            throw error;
        } else if (user) {
            console.log(user, "USER")
        }
        return { user, message: "Phone verified successfully" };
    },

    async getUserProfile(userId) {
        const user = await UserModel.getUserProfile(userId);
        if (user) {
            const { limits, planType, planName } = await getPlanLimitsForUser(userId, user.role);
            user.planLimits = limits;
            user.activePlanType = planType;
            user.activePlanName = planName;

            if (user.companyProfile) {
                user.address = user.companyProfile.address;
                user.about = user.companyProfile.about;
                user.website = user.companyProfile.website;
                user.latitude = user.companyProfile.latitude;
                user.longitude = user.companyProfile.longitude;
            }

            if (user.trainingCentreProfile) {
                user.centreName = user.trainingCentreProfile.centreName || user.centreName;
                user.tagline = user.trainingCentreProfile.tagline;
                user.centreType = user.trainingCentreProfile.centreType;
                user.registrationNumber = user.trainingCentreProfile.registrationNumber;
                user.affiliationNumber = user.trainingCentreProfile.affiliationNumber;
                user.establishedYear = user.trainingCentreProfile.establishedYear;
                user.contactPerson = user.trainingCentreProfile.contactPerson;
                user.contactDesignation = user.trainingCentreProfile.contactDesignation;
                user.primaryPhone = user.trainingCentreProfile.primaryPhone || user.phone;
                user.alternativePhone = user.trainingCentreProfile.alternativePhone;
                user.officialEmail = user.trainingCentreProfile.officialEmail || user.email;
                user.website = user.trainingCentreProfile.website;
                user.facebookUrl = user.trainingCentreProfile.facebookUrl;
                user.linkedinUrl = user.trainingCentreProfile.linkedinUrl;
                user.youtubeUrl = user.trainingCentreProfile.youtubeUrl;
                user.address = user.trainingCentreProfile.address;
                user.city = user.trainingCentreProfile.city;
                user.district = user.trainingCentreProfile.district;
                user.province = user.trainingCentreProfile.province;
                user.postalCode = user.trainingCentreProfile.postalCode;
                user.latitude = user.trainingCentreProfile.latitude;
                user.longitude = user.trainingCentreProfile.longitude;
                user.about = user.trainingCentreProfile.about;
                user.facilities = user.trainingCentreProfile.facilities || [];
                user.specializations = user.trainingCentreProfile.specializations || [];
                user.operatingHours = user.trainingCentreProfile.operatingHours;
                user.coverImage = user.trainingCentreProfile.coverImage;
            }
        }
        return { user, message: "User profile fetched successfully" };
    },

    async updateProfile(userId, data) {
        await UserModel.updateProfile(userId, data);
        const userProfile = await UserModel.getUserProfile(userId);
        if (userProfile) {
            const { limits, planType, planName } = await getPlanLimitsForUser(userId, userProfile.role);
            userProfile.planLimits = limits;
            userProfile.activePlanType = planType;
            userProfile.activePlanName = planName;

            if (userProfile.companyProfile) {
                userProfile.address = userProfile.companyProfile.address;
                userProfile.about = userProfile.companyProfile.about;
                userProfile.website = userProfile.companyProfile.website;
                userProfile.latitude = userProfile.companyProfile.latitude;
                userProfile.longitude = userProfile.companyProfile.longitude;
            }

            if (userProfile.trainingCentreProfile) {
                userProfile.centreName = userProfile.trainingCentreProfile.centreName || userProfile.centreName;
                userProfile.tagline = userProfile.trainingCentreProfile.tagline;
                userProfile.centreType = userProfile.trainingCentreProfile.centreType;
                userProfile.registrationNumber = userProfile.trainingCentreProfile.registrationNumber;
                userProfile.affiliationNumber = userProfile.trainingCentreProfile.affiliationNumber;
                userProfile.establishedYear = userProfile.trainingCentreProfile.establishedYear;
                userProfile.contactPerson = userProfile.trainingCentreProfile.contactPerson;
                userProfile.contactDesignation = userProfile.trainingCentreProfile.contactDesignation;
                userProfile.primaryPhone = userProfile.trainingCentreProfile.primaryPhone || userProfile.phone;
                userProfile.alternativePhone = userProfile.trainingCentreProfile.alternativePhone;
                userProfile.officialEmail = userProfile.trainingCentreProfile.officialEmail || userProfile.email;
                userProfile.website = userProfile.trainingCentreProfile.website;
                userProfile.facebookUrl = userProfile.trainingCentreProfile.facebookUrl;
                userProfile.linkedinUrl = userProfile.trainingCentreProfile.linkedinUrl;
                userProfile.youtubeUrl = userProfile.trainingCentreProfile.youtubeUrl;
                userProfile.address = userProfile.trainingCentreProfile.address;
                userProfile.city = userProfile.trainingCentreProfile.city;
                userProfile.district = userProfile.trainingCentreProfile.district;
                userProfile.province = userProfile.trainingCentreProfile.province;
                userProfile.postalCode = userProfile.trainingCentreProfile.postalCode;
                userProfile.latitude = userProfile.trainingCentreProfile.latitude;
                userProfile.longitude = userProfile.trainingCentreProfile.longitude;
                userProfile.about = userProfile.trainingCentreProfile.about;
                userProfile.facilities = userProfile.trainingCentreProfile.facilities || [];
                userProfile.specializations = userProfile.trainingCentreProfile.specializations || [];
                userProfile.operatingHours = userProfile.trainingCentreProfile.operatingHours;
                userProfile.coverImage = userProfile.trainingCentreProfile.coverImage;
            }
        }
        return { updatedUser: userProfile, message: "Profile updated successfully" };
    },
    async createOrUpdateExperience(userId, data) {
        const experience = await UserModel.createOrUpdateExperience(userId, data);
        return { experience, message: "Experience created or updated successfully" };
    },
    async deleteExperience(experienceId) {
        const deletedExperience = await UserModel.deleteExperience(experienceId);
        return { deletedExperience, message: "Experience deleted successfully" };
    },
    async createOrUpdateEducation(userId, data) {
        const education = await UserModel.createOrUpdateEducation(userId, data);
        return { education, message: "Education details created or updated successfully" };
    },
    async deleteEducation(educationId) {
        const deletedEducation = await UserModel.deleteEducation(educationId);
        return { deletedEducation, message: "Education details deleted successfully" };
    },
    async createOrUpdateCertification(userId, data) {
        const certification = await UserModel.createOrUpdateCertification(userId, data);
        return { certification, message: "Certification Created or Updated successfully" }
    },
    async deleteCertification(certificationId) {
        const deletedCertification = await UserModel.deleteCertification(certificationId);
        return { deletedCertification, message: "Certification deleted successfully" };
    },

    async listAllUsersForDropdown(page, limit, role) {
        const { users, count } = await UserModel.listAllUsersForDropdown(Number(page), Number(limit), role)
        return {
            users: users,
            count: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            message: "Users fetched successfully"
        }

    },

    async uploadBusinessDocument(userId, files) {
        if (!files || !files.businessDocument) {
            throw new Error("Business document is required");
        }
        const file = files.businessDocument[0];
        const uploadedDoc = await uploadToS3(file.buffer, file.originalname, file.mimetype, "documents");
        const updatedUser = await UserModel.updateVerificationDocument(userId, uploadedDoc.Location);
        return { updatedUser, message: "Business verification document uploaded successfully. Status set to Pending Verification." };
    },

    async adminVerifyUser(userId, { isAdminApproved, verificationStatus }) {
        const updateData = {};
        if (isAdminApproved !== undefined) {
            updateData.isAdminApproved = isAdminApproved;
        }
        if (verificationStatus !== undefined) {
            updateData.verificationStatus = verificationStatus;
            if (verificationStatus === "VERIFIED") {
                updateData.isVerified = true;
            } else if (verificationStatus === "REJECTED" || verificationStatus === "UNVERIFIED") {
                updateData.isVerified = false;
            }
        }
        const updatedUser = await UserModel.adminVerifyUser(userId, updateData);
        return updatedUser;
    },

    async clearResume(userId) {
        await UserModel.clearResume(userId);
        return { message: "Resume cleared successfully" };
    }
}

module.exports = UserService;