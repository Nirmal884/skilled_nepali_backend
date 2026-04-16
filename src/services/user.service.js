const UserModel = require("../models/user.model");
const { uploadToS3 } = require("../utils/s3Uploader");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

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
    async login(email, passowrd) {

        const user = await UserModel.findUserByEmail(email);
        console.log(user, "USER", email)
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

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.fullName,
            companyName: user.companyName,
            companyLogo: user.companyLogo,
            centreName: user.centreName,
            centreLogo: user.centreLogo
        }, process.env.JWT_SECRET, { expiresIn: '24h' })

        return ({
            message: "Successfully logged in",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.fullName,
                companyName: user.companyName,
                companyLogo: user.companyLogo,
                centreName: user.centreName,
                centreLogo: user.centreLogo,

            }
        })

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
    }

}

module.exports = UserService;