const NewsLetterModel = require("../models/newsletter.model");

const NewsLetterService = {
    async subscribe(email) {
        const result = await NewsLetterModel.subscribe(email)
        return result;
    }
}

module.exports = NewsLetterService;