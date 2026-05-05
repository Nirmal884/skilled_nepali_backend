const NewsLetterService = require("../services/newsletter.service");

const NewsLetterController = {
    async subscribe(req, res) {
        try {
            const email = req.body.email;
            const result = await NewsLetterService.subscribe(email);

            return res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Thanks for subscribing to our newsletter!",
            })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                statusCode: 500,
                message: error?.message
            });
        }
    }
}

module.exports = NewsLetterController