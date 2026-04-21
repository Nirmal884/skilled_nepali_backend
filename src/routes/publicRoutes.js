const express = require('express');
const JobCategoryController = require('../controllers/jobCategory.controller');
const ApplicantTypeController = require('../controllers/applicantType.controller');
const upload = require('../middleware/multer');
const UserController = require('../controllers/user.controller');
const loginLimiter = require('../middleware/ratelimiter');
const { authenticate } = require('../middleware/auth.middleware');
const JobController = require('../controllers/job.controller');
const AdminDashboardController = require('../controllers/admin.controller');
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
router.get("/get-all-users", authenticate, UserController.getAllUsers);
router.delete("/delete-user/:id", authenticate, UserController.deleteUser);
router.get("/get-user-profile/:id", authenticate, UserController.getUserProfile);
router.put("/update-profile/:id", authenticate, UserController.updateProfile);
router.post("/create-or-update-experience/:id", authenticate, UserController.createOrUpdateExperience);

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

// admin router
router.get('/get-admin-dashboard-stats', authenticate, AdminDashboardController.getAdminDashboardStats)

module.exports = router;