const express = require('express');
const JobCategoryController = require('../controllers/jobCategory.controller');
const ApplicantTypeController = require('../controllers/applicantType.controller');
const upload = require('../middleware/multer');
const UserController = require('../controllers/user.controller');
const loginLimiter = require('../middleware/ratelimiter');
const router = express.Router();

// user section routes
router.post("/create-user", upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
    { name: 'centreLogo', maxCount: 1 }
]), UserController.createUser);
router.post("/login", loginLimiter, UserController.login);

// job category routes
router.get('/get-job-categories', JobCategoryController.getAllJobCategories);
router.get('/get-countries', JobCategoryController.getCountries);

// applicant type routes 
router.get('/get-applicant-type', ApplicantTypeController.getApplicantTypes)

module.exports = router;