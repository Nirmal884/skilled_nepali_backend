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

    async getAllUsers(role, search, page, limit) {

        const roleCondition = role === 'ADMIN'
            ? { not: 'ADMIN' }
            : role;

        const whereClause = {
            deletedAt: null,
            role: roleCondition
        };

        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { centreName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, count] = await prisma.$transaction([
            prisma.user.findMany({ where: whereClause, skip: page ? (page - 1) * limit : 0, take: limit ? limit : 10 }),
            prisma.user.count({ where: whereClause })
        ]);
        return { users, count };
    },

    async deleteUser(userId) {
        const deletedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedUser;
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