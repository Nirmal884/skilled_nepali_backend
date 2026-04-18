const SkillsModel = require("../models/skills.model");

const SkillsService = {
    async createSkills(data) {
        const existingSkills = await SkillsModel.getSkillByName(data.skillName);
        if (existingSkills) {
            throw new Error("Skill already exists");
        }
        return await SkillsModel.createSkill(data.skillName);
    },
    async getAllSkills() {
        return await SkillsModel.getAllSkills();
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