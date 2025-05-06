const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// General file upload routes
router.post('/', uploadController.uploadFile);
router.get('/all', uploadController.getAllUploads);
router.get('/my-uploads', uploadController.getUploadsByUser);
router.get('/user/:userId', uploadController.getUploadsByUser);

// Employee-specific file upload routes
router.post('/employee', uploadController.uploadFileForEmployee);
router.get('/employee/:employeeId', uploadController.getUploadsByEmployee);

// File operations by ID
router.get('/:id', uploadController.getUploadById);
router.get('/:id/download', uploadController.downloadFile);
router.patch('/:id/description', uploadController.updateDescription);
router.delete('/:id', uploadController.deleteFile);

module.exports = router;