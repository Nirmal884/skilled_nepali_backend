const express = require('express');
const JobCategoryController = require('../controllers/jobCategory.controller');
const ApplicantTypeController = require('../controllers/applicantType.controller');
const upload = require('../middleware/multer');
const UserController = require('../controllers/user.controller');
const loginLimiter = require('../middleware/ratelimiter');
const { authenticate, optionalAuthenticate, authorize, blockImpersonatedSession } = require('../middleware/auth.middleware');
const ImpersonationController = require('../controllers/impersonation.controller');
const JobController = require('../controllers/job.controller');
const AdminDashboardController = require('../controllers/admin.controller');
const SkillsController = require('../controllers/skills.controller');
const TestimonialsController = require('../controllers/testimonials.controller');
const NewsLetterController = require('../controllers/newsletter.controller');
const SubscriptionController = require('../controllers/subscription.controller');
const PlanController = require('../controllers/plan.controller');
const TrainingController = require('../controllers/training.controller');
const CourseEnrollmentController = require('../controllers/courseEnrollment.controller');
const AIController = require('../controllers/ai.controller');
const ProfileRequestController = require('../controllers/profileRequest.controller');
const router = express.Router();

// users routes
router.post("/create-user", upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
    { name: 'centreLogo', maxCount: 1 }
]), UserController.createUser);
router.post("/login", loginLimiter, UserController.login);
router.post("/logout", UserController.logout);
router.post("/send-otp-for-password-change", UserController.sendOtpForPasswordChange);
router.post("/verify-otp-for-password-change", UserController.verifyOtpForPasswordChange);
router.post("/change-password", UserController.changePassword);
router.get("/me", authenticate, UserController.getMe);
router.post("/verify-phone", UserController.verifyPhone);
router.post("/update-logo", authenticate, upload.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'centreLogo', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
]), UserController.updateLogo);
router.post("/update-resume", authenticate, upload.fields([
    { name: 'resume', maxCount: 1 }
]), UserController.updateResume);
router.get("/get-all-users", authenticate, UserController.getAllUsers);
router.get("/list-all-users-for-dropdown", UserController.listAllUsersForDropdown);
router.delete("/delete-user/:id", authenticate, UserController.deleteUser);
router.get("/get-user-profile/:id", authenticate, UserController.getUserProfile);
router.put("/update-profile/:id", authenticate, UserController.updateProfile);
router.post("/create-or-update-experience/:id", authenticate, UserController.createOrUpdateExperience);
router.post("/delete-experience/:id", authenticate, UserController.deleteExperience);
router.post("/create-or-update-education/:id", authenticate, UserController.createOrUpdateEducation);
router.post("/delete-education/:id", authenticate, UserController.deleteEducation);
router.post("/create-or-update-certification/:id", authenticate, UserController.createOrUpdateCertification);
router.post("/delete-certification/:id", authenticate, UserController.deleteCertification);
router.post("/clear-resume", authenticate, UserController.clearResume);

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
router.post('/create-job-category', authenticate, authorize('ADMIN'), JobCategoryController.createJobCategory)
router.put('/update-job-category/:id', authenticate, authorize('ADMIN'), JobCategoryController.updateJobCategory);
router.delete('/delete-job-category/:id', authenticate, authorize('ADMIN'), JobCategoryController.deleteJobCategory);
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
router.get('/download-applied-jobs-excel', authenticate, JobController.downloadAppliedJobsExcel)
router.patch('/update-job-status', authenticate, JobController.updateJobApplicationStatus)

// admin router
router.get('/get-admin-dashboard-stats', authenticate, AdminDashboardController.getAdminDashboardStats)
router.get('/get-user-growth-graph-stats', authenticate, AdminDashboardController.getUserGrowthGraphStats)
router.get('/get-total-applications-graph-stats', authenticate, AdminDashboardController.getTotalApplicationsGraphStats)
router.get('/download-all-users-excel', authenticate, AdminDashboardController.downloadUsersExcel)

// news letter router
router.post('/subscribe', NewsLetterController.subscribe)

//subscription route
router.post('/create-subscription', authenticate, blockImpersonatedSession, SubscriptionController.createSubscription)

//verify subscription
router.post('/verify-subscription', authenticate, blockImpersonatedSession, SubscriptionController.verifySubscription)

//plan routes
router.post('/create-plan', authenticate, authorize('ADMIN'), PlanController.createPlan)
router.patch('/toggle-plan-status/:id', authenticate, authorize('ADMIN'), PlanController.togglePlanStatus)
router.get('/get-plans', PlanController.getPlans)

//course&training
router.post('/create-course', authenticate, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
]), TrainingController.createCourse)
router.get('/get-courses', authenticate, TrainingController.getAllCourses)
router.get('/get-courses-dropdown', authenticate, TrainingController.getCoursesDropdown)
router.get('/get-all-course-list', TrainingController.getAllCoursesList)
router.put('/edit-selected-course/:id', authenticate, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
]), TrainingController.editSelectedCourse)
router.get('/get-single-course/:id', TrainingController.getSingleCourseDetails)
router.delete('/delete-course/:id', authenticate, TrainingController.deleteCourse)
router.put('/admin-approve-course/:id', authenticate, authorize('ADMIN'), TrainingController.adminApproveCourse)
router.get('/list-delete-requested-courses', authenticate, authorize('ADMIN'), TrainingController.listDeleteRequestedCourses)

// course enrollment routes
router.post('/enroll-course', CourseEnrollmentController.enrollInCourse)
router.get('/user-enrollments/:userId', CourseEnrollmentController.getUserEnrollments)
router.get('/course-enrollments/:courseId', CourseEnrollmentController.getCourseEnrollments)
router.get('/centre-enrollments', authenticate, authorize('TRAINING_CENTRE'), CourseEnrollmentController.getCentreEnrollments)
router.get('/admin-course-enrollments', authenticate, authorize('ADMIN'), CourseEnrollmentController.getAdminCourseEnrollments)
router.put('/enrollment-status/:id', authenticate, CourseEnrollmentController.updateEnrollmentStatus)
router.post('/manual-enroll-course', authenticate, authorize('TRAINING_CENTRE'), CourseEnrollmentController.manualEnrollInCourse)

// chatbot route
router.post('/chat', AIController.handleChat);

const multer = require('multer');
const audioUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/voice-to-text', audioUpload.single('audio'), AIController.voiceToText);
router.post('/parse-resume-json', AIController.parseResumeJson);

router.post("/upload-business-document", authenticate, upload.fields([{ name: 'businessDocument', maxCount: 1 }]), UserController.uploadBusinessDocument);
router.put("/admin/verify-user/:id", authenticate, authorize('ADMIN'), UserController.adminVerifyUser);

// Impersonation routes
router.post('/admin/impersonate', authenticate, authorize('ADMIN'), ImpersonationController.impersonateUser);
router.post('/admin/stop-impersonation', authenticate, ImpersonationController.stopImpersonating);

// Profile Request routes
router.post('/profile-requests', authenticate, authorize('EMPLOYER'), ProfileRequestController.createProfileRequest);
router.get('/profile-requests/employer', authenticate, authorize('EMPLOYER'), ProfileRequestController.getEmployerProfileRequests);
router.get('/profile-requests/admin', authenticate, authorize('ADMIN'), ProfileRequestController.getAdminProfileRequests);
router.put('/profile-requests/:id/status', authenticate, authorize('ADMIN'), ProfileRequestController.updateProfileRequestStatus);
router.get('/profile-requests/:id/candidates', authenticate, ProfileRequestController.getApprovedRequestCandidates);
router.get('/profile-requests/:id/candidates/download', authenticate, ProfileRequestController.downloadApprovedRequestCandidatesExcel);

module.exports = router;