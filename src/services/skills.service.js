const SkillsModel = require("../models/skills.model");

const SkillsService = {
    async createSkills(skillName, userId) {
        return await SkillsModel.createSkill(skillName, userId);
    },
    async getAllSkills(page, limit, search) {
        const { skills, totalSkills } = await SkillsModel.getAllSkills(Number(page), Number(limit), search);
        return { skills, totalSkills };
    },
    async getSkillByName(skillName) {
        return await SkillsModel.getSkillByName(skillName);
    },
    async updateSkill(id, skillName) {
        return await SkillsModel.updateSkill(id, skillName);
    },
    async deleteSkill(id) {
        return await SkillsModel.deleteSkill(id);
    }
}

module.exports = SkillsService