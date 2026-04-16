const express = require('express');
const JobCategoryController = require('../controllers/jobCategory.controller');
const ApplicantTypeController = require('../controllers/applicantType.controller');
const upload = require('../middleware/multer');
const UserController = require('../controllers/user.controller');
const loginLimiter = require('../middleware/ratelimiter');
const { authenticate } = require('../middleware/auth.middleware');
const JobController = require('../controllers/job.controller');
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

module.exports = router;