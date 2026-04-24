const TestimonialService = require("../services/testimonials.service");

const TestimonialsController = {
    async addTestimonial(req, res) {
        try {
            const data = req.body;
            if (!data.name || !data.role || !data.quote || !data.country) {
                throw new Error("Please provide all the required fields");
            }
            const testimonial = await TestimonialService.addTestimonial(data);
            return res.status(201).json({ success: true, message: "Testimonial added successfully", data: testimonial });
        } catch (error) {
            return res.status(error?.statusCode || 500).json({ success: false, message: "Failed to add testimonial", error: error.message });
        }
    },

    async getApprovedTestimonials(req, res) {
        try {
            const { page, limit, role } = req.query;
            const { testimonials, count } = await TestimonialService.getApprovedTestimonials(page, limit, role);
            return res.status(200).json({ success: true, message: "Testimonials fetched successfully", data: testimonials, count });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to fetch testimonials", error: error.message });
        }
    },

    async getAllTestimonials(req, res) {
        try {
            const { page, limit, search } = req.query;
            const { testimonials, count } = await TestimonialService.getAllTestimonials(page, limit, search);
            return res.status(200).json({ success: true, message: "Testimonials fetched successfully", data: testimonials, count });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to fetch testimonials", error: error.message });
        }
    },

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!id || !status) {
                throw new Error("ID and status are required");
            }
            const testimonial = await TestimonialService.updateStatus(id, status);
            return res.status(200).json({ success: true, message: `Testimonial ${status.toLowerCase()} successfully`, data: testimonial });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to update testimonial status", error: error.message });
        }
    },

    async addEnquiry(req, res) {
        try {
            const data = req.body;
            if (!data.name || !data.email || !data.phone || !data.subject || !data.enquiry) {
                throw new Error("Please provide all the required fields");
            }
            const enquiry = await TestimonialService.addEnquiry(data);
            return res.status(201).json({ success: true, message: "Enquiry added successfully", data: enquiry });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to add enquiry", error: error.message });
        }
    },

    async getEnquiries(req, res) {
        try {
            const { page, limit, search, subject } = req.query;
            const { enquiries, count } = await TestimonialService.getEnquiries(page, limit, search, subject);
            return res.status(200).json({ success: true, message: "Enquiries fetched successfully", data: enquiries, count });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to fetch enquiries", error: error.message });
        }
    },
}

module.exports = TestimonialsController;
