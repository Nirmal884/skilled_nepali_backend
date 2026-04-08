const UserModel = require("../models/user.model");
const { uploadToS3 } = require("../utils/s3Uploader");
const bcrypt = require("bcryptjs");

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
    }
}

module.exports = UserService;