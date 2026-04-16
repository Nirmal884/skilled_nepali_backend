const prisma = require("../config/db")

const UserModel = {
    async createUser(data) {
        const filteredData = {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            country: data.country,
            role: data.role,
            phone: data.phone,
            experience: data.experience,
            pastExperience: data.pastExperience,
            resume: data.resume,
            companyName: data.companyName,
            designation: data.designation,
            companyLogo: data.companyLogo,
            centreName: data.centreName,
            centreLogo: data.centreLogo,
        };
        if (data.jobCategoryId) {
            filteredData.jobCategory = { connect: { id: data.jobCategoryId } };
        }
        if (data.applicantTypeId) {
            filteredData.applicantType = { connect: { id: data.applicantTypeId } };
        }

        const userData = await prisma.user.create({
            data: filteredData
        })
        return userData;
    },

    async updateLogo(userId, role, logo) {
        const data = {};
        if (role === "EMPLOYER") {
            data.companyLogo = logo;
        } else if (role === "TRAINING_CENTRE") {
            data.centreLogo = logo;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data
        })
        return updatedUser;
    },

    async findUserByEmail(email) {
        const userList = await prisma.user.findFirst({
            where: { email: email, deletedAt: null }
        })
        // console.log(userList, "UserList")
        return userList;
    },

    async verifyPhone(phone) {
        const userList = await prisma.user.findFirst({
            where: { phone: phone, deletedAt: null }
        })
        console.log(userList, "PHONE VERIFY")
        return userList;

    }
}

module.exports = UserModel;