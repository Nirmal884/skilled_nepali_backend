const SkillsService = require("../services/skills.service");

const SkillsController = {
    async createSkills(req, res) {
        try {
            const { skillName } = req.body;
            const userId = req.user.id;
            const skills = await SkillsService.createSkills(skillName, userId);
            return res.status(201).json({
                success: true,
                message: "Skill created successfully",
                data: skills
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to create skill",
                error: error.message
            })
        }
    },
    async getAllSkills(req, res) {
        try {
            const { page, limit, search } = req.query;
            const { skills, totalSkills } = await SkillsService.getAllSkills(page, limit, search);
            return res.status(200).json({
                success: true,
                message: "Skills fetched successfully",
                data: skills,
                count: totalSkills
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch skills",
                error: error.message
            })
        }
    },
    async getSkillByName(req, res) {
        try {
            const { skillName } = req.params;
            const skills = await SkillsService.getSkillByName(skillName);
            return res.status(200).json({
                success: true,
                message: "Skill fetched successfully",
                data: skills
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch skill",
                error: error.message
            })
        }
    },
    async updateSkill(req, res) {
        try {
            const { id } = req.params;
            const { skillName } = req.body;
            const skills = await SkillsService.updateSkill(id, skillName);
            return res.status(200).json({
                success: true,
                message: "Skill updated successfully",
                data: skills
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update skill",
                error: error.message
            })
        }
    },
    async deleteSkill(req, res) {
        try {
            const { id } = req.params;
            const skills = await SkillsService.deleteSkill(id);
            return res.status(200).json({
                success: true,
                message: "Skill deleted successfully",
                data: skills
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete skill",
                error: error.message
            })
        }
    }
}

module.exports = SkillsController