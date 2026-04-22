const SkillsModel = require("../models/skills.model");

const SkillsService = {
    async createSkills(data) {
        const existingSkills = await SkillsModel.getSkillByName(data.skillName);
        if (existingSkills) {
            throw new Error("Skill already exists");
        }
        return await SkillsModel.createSkill(data.skillName);
    },
    async getAllSkills(page, limit) {
        const { skills, totalSkills } = await SkillsModel.getAllSkills(Number(page), Number(limit));
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