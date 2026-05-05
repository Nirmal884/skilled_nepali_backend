const prisma = require("../config/db")

const NewsLetterModel = {
    async subscribe(email) {
        const isSubscribed = await prisma.newsLetter.findUnique({
            where: {
                email
            }
        })
        if (isSubscribed) {
            throw new Error("You are already subscribed to our newsletter")
        }

        if (!email || email.trim() === "") {
            throw new Error("Email is required")
        }
        const result = await prisma.newsLetter.create({
            data: {
                email
            }
        })
        return result;
    },

}

module.exports = NewsLetterModel;
