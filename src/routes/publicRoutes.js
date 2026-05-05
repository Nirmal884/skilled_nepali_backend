const express = require('express');
const JobCategoryController = require('../controllers/jobCategory.controller');
const ApplicantTypeController = require('../controllers/applicantType.controller');
const upload = require('../middleware/multer');
const UserController = require('../controllers/user.controller');
const loginLimiter = require('../middleware/ratelimiter');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth.middleware');
const JobController = require('../controllers/job.controller');
const AdminDashboardController = require('../controllers/admin.controller');
const SkillsController = require('../controllers/skills.controller');
const TestimonialsController = require('../controllers/testimonials.controller');
const NewsLetterController = require('../controllers/newsletter.controller');
const router = express.Router();

// users routes
router.post("/create-user", upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
    { name: 'centreLogo', maxCount: 1 }
]), UserController.createUser);
router.post("/login", loginLimiter, UserController.login);
router.post("/logout", UserController.logout);
router.get("/me", authenticate, UserController.getMe);
router.post("/verify-phone", UserController.verifyPhone);
router.post("/update-logo", authenticate, upload.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'centreLogo', maxCount: 1 }
]), UserController.updateLogo);
router.post("/update-resume", authenticate, upload.fields([
    { name: 'resume', maxCount: 1 }
]), UserController.updateResume);
router.get("/get-all-users", authenticate, UserController.getAllUsers);
router.delete("/delete-user/:id", authenticate, UserController.deleteUser);
router.get("/get-user-profile/:id", authenticate, UserController.getUserProfile);
router.put("/update-profile/:id", authenticate, UserController.updateProfile);
router.post("/create-or-update-experience/:id", authenticate, UserController.createOrUpdateExperience);
router.post("/delete-experience/:id", authenticate, UserController.deleteExperience);
router.post("/create-or-update-education/:id", authenticate, UserController.createOrUpdateEducation);
router.post("/delete-education/:id", authenticate, UserController.deleteEducation);
router.post("/create-or-update-certification/:id", authenticate, UserController.createOrUpdateCertification);
router.post("/delete-certification/:id", authenticate, UserController.deleteCertification);

// skills section
router.post("/create-skills", authenticate, SkillsController.createSkills);
router.post("/delete-skill/:id", authenticate, SkillsController.deleteSkill);
router.get("/get-all-skills", authenticate, SkillsController.getAllSkills);

// testimonials section 
router.post("/create-testimonial", TestimonialsController.addTestimonial);
router.get("/get-all-testimonials", authenticate, TestimonialsController.getAllTestimonials);
router.get("/get-testimonials", TestimonialsController.getApprovedTestimonials);
router.post("/update-testimonial-status/:id", authenticate, TestimonialsController.updateStatus);

// enquiries section 
router.post("/create-enquiry", TestimonialsController.addEnquiry);
router.get("/get-enquiries", authenticate, TestimonialsController.getEnquiries);

// job category routes
router.get('/get-job-categories', JobCategoryController.getAllJobCategories);
router.get('/get-countries', JobCategoryController.getCountries);

// applicant type routes 
router.get('/get-applicant-type', ApplicantTypeController.getApplicantTypes)

// job routes
router.post('/create-job', authenticate, JobController.createJob)
router.get('/get-all-jobs', authenticate, JobController.listAllJobs)
router.get('/get-job-for-dashboard', authenticate, JobController.listJobForDashboard)
router.get('/get-job/:id', authenticate, JobController.getJobById)
router.post('/admin-approve-job', authenticate, JobController.adminApproveJob)
router.post('/delete-job-request', authenticate, JobController.deleteJobRequest)
router.get('/list-delete-requested-jobs', authenticate, JobController.listDeleteRequestedJobs)
router.post('/approve-job-deletion', authenticate, JobController.approveDeletion)
router.post('/cancel-job-deletion-request', authenticate, JobController.cancelDeletionRequest)
router.get('/list-all-verified-jobs', optionalAuthenticate, JobController.listAllApprovedJobs)
router.get('/fetch-job-by-id/:jobId', optionalAuthenticate, JobController.fetchJobById)
router.post('/apply-job', authenticate, authorize('JOBSEEKER'), JobController.applyJob)
router.get('/list-applied-jobs', authenticate, JobController.listJobApplicaton)
router.patch('/update-job-status', authenticate, JobController.updateJobApplicationStatus)

// admin router
router.get('/get-admin-dashboard-stats', authenticate, AdminDashboardController.getAdminDashboardStats)
router.get('/get-user-growth-graph-stats', authenticate, AdminDashboardController.getUserGrowthGraphStats)
router.get('/get-total-applications-graph-stats', authenticate, AdminDashboardController.getTotalApplicationsGraphStats)

// news letter router
router.post('/subscribe', NewsLetterController.subscribe)

module.exports = router;