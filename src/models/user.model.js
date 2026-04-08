const prisma = require("../config/db")

const UserModel = {
    async createUser(data) {
        const userData = await prisma.user.create({
            data: data
        })
        return userData;
    },

    async findUserByEmail(email) {
        const userList = await prisma.user.findFirst({
            where: { email: email, deletedAt: null }
        })
        return userList;
    }
}

module.exports = UserModel;