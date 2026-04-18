const prisma = require("../config/db")

const SkillsModel = {
    async createSkill(skillName) {
        return await prisma.skill.create({
            data: {
                skillName
            }
        })
    },
    async getAllSkills() {
        return await prisma.skill.findMany({
            where: {
                deletedAt: null
            }
        })
    },
    async getSkillByName(skillName) {
        return await prisma.skill.findUnique({
            where: {
                deletedAt: null,
                skillName
            }
        })
    },
    async updateSkill(id, skillName) {
        return await prisma.skill.update({
            where: {
                id
            },
            data: {
                skillName
            }
        })
    },
    async deleteSkill(id) {
        return await prisma.skill.update({
            where: {
                id
            },
            data: {
                deletedAt: new Date()
            }
        })
    }
}

module.exports = SkillsModel