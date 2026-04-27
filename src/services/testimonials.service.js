const TestimonialModel = require("../models/testimonial.model");

const TestimonialService = {
    async addTestimonial(data) {
        const testimonial = await TestimonialModel.addTestimonial(data);
        return testimonial;
    },

    async getApprovedTestimonials(page, limit, role, company) {
        const { testimonials, count } = await TestimonialModel.getApprovedTestimonials(Number(page), Number(limit), role, company);
        return { testimonials, count };
    },

    async getAllTestimonials(page, limit, search, role, company) {
        const { testimonials, count } = await TestimonialModel.getAllTestimonials(Number(page), Number(limit), search, role, company);
        return { testimonials, count };
    },

    async updateStatus(id, status) {
        return await TestimonialModel.updateStatus(id, status);
    },

    async addEnquiry(data) {
        return await TestimonialModel.addEnquiry(data);
    },

    async getEnquiries(page, limit, search, subject) {
        const { enquiries, count } = await TestimonialModel.getEnquiries(Number(page), Number(limit), search, subject);
        return { enquiries, count };
    }


}

module.exports = TestimonialService;
