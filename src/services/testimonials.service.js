const TestimonialModel = require("../models/testimonial.model");

const TestimonialService = {
    async addTestimonial(data) {
        const testimonial = await TestimonialModel.addTestimonial(data);
        return testimonial;
    },

    async getApprovedTestimonials(page, limit) {
        const { testimonials, count } = await TestimonialModel.getApprovedTestimonials(Number(page), Number(limit));
        return { testimonials, count };
    },

    async getAllTestimonials(page, limit, search) {
        const { testimonials, count } = await TestimonialModel.getAllTestimonials(Number(page), Number(limit), search);
        return { testimonials, count };
    },

    async updateStatus(id, status) {
        return await TestimonialModel.updateStatus(id, status);
    }
}

module.exports = TestimonialService;
