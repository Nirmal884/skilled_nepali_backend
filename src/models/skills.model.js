const prisma = require("../config/db")

const SkillsModel = {
    async createSkill(skillName) {
        return await prisma.skill.create({
            data: {
                skillName
            }
        })
    },
    async getAllSkills(page, limit) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 20;
        const [skills, totalSkills] = await prisma.$transaction([
            prisma.skill.findMany({
                where: {
                    deletedAt: null
                },
                skip,
                take,
                orderBy: {
                    skillName: "asc"
                }
            }),
            prisma.skill.count({
                where: {
                    deletedAt: null
                }
            })
        ])
        return { skills, totalSkills }
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