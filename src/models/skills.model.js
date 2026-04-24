const prisma = require("../config/db")

const SkillsModel = {
    async createSkill(skillName, userId) {
        return await prisma.skill.upsert({
            where: {
                skillName
            },
            update: {
                users: {
                    connect: { id: userId }
                }
            },
            create: {
                skillName,
                users: {
                    connect: { id: userId }
                }
            }
        })
    },
    async getAllSkills(page, limit, search) {
        const skip = page ? (page - 1) * limit : 0;
        const take = limit ? limit : 20;

        const whereCondition = {
            deletedAt: null,
            ...(search && {
                skillName: {
                    contains: search,
                    mode: 'insensitive'
                }
            })
        };

        const [skills, totalSkills] = await prisma.$transaction([
            prisma.skill.findMany({
                where: whereCondition,
                skip,
                take,
                orderBy: {
                    skillName: "asc"
                }
            }),
            prisma.skill.count({
                where: whereCondition
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