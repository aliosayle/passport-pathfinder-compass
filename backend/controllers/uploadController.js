const Upload = require('../models/upload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept common file types
  const allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/gif', 
    'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed',
    'text/plain', 'text/csv'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, ZIP, TXT, and CSV files are allowed.'), false);
  }
};

// Configure upload limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Controller for file upload operations
exports.uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      // Check if file exists in request
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Create file record in database
      const fileData = {
        id: uuidv4(),
        user_id: req.user.id,
        file_name: req.file.filename,
        original_name: req.file.originalname,
        file_path: path.join('uploads', req.file.filename),
        file_size: req.file.size,
        file_type: req.file.mimetype,
        upload_date: new Date(),
        description: req.body.description || null
      };
      
      const fileId = await Upload.create(fileData);
      
      // Fetch the created file record
      const fileRecord = await Upload.findById(fileId);
      
      res.status(201).json({
        message: 'File uploaded successfully',
        file: fileRecord
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ 
        message: 'Failed to upload file',
        error: error.message 
      });
    }
  }
];

// Upload a file for a specific employee
exports.uploadFileForEmployee = [
  upload.single('file'),
  async (req, res) => {
    try {
      // Check if file exists in request
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Check if employeeId is provided
      if (!req.body.employeeId) {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
      
      // Create file record in database
      const fileData = {
        id: uuidv4(),
        user_id: req.user.id,
        employee_id: req.body.employeeId,
        file_name: req.file.filename,
        original_name: req.file.originalname,
        file_path: path.join('uploads', req.file.filename),
        file_size: req.file.size,
        file_type: req.file.mimetype,
        upload_date: new Date(),
        description: req.body.description || null
      };
      
      const fileId = await Upload.create(fileData);
      
      // Fetch the created file record
      const fileRecord = await Upload.findById(fileId);
      
      res.status(201).json({
        message: 'File uploaded successfully for employee',
        file: fileRecord
      });
    } catch (error) {
      console.error('Error uploading file for employee:', error);
      res.status(500).json({ 
        message: 'Failed to upload file for employee',
        error: error.message 
      });
    }
  }
];

// Get all file uploads
exports.getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.findAll();
    res.status(200).json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ 
      message: 'Failed to fetch uploads',
      error: error.message 
    });
  }
};

// Get file uploads by user
exports.getUploadsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const uploads = await Upload.findByUserId(userId);
    res.status(200).json(uploads);
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user uploads',
      error: error.message 
    });
  }
};

// Get file uploads by employee
exports.getUploadsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }
    
    const uploads = await Upload.findByEmployeeId(employeeId);
    res.status(200).json(uploads);
  } catch (error) {
    console.error('Error fetching employee uploads:', error);
    res.status(500).json({ 
      message: 'Failed to fetch employee uploads',
      error: error.message 
    });
  }
};

// Get file upload by ID
exports.getUploadById = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.status(200).json(upload);
  } catch (error) {
    console.error('Error fetching file details:', error);
    res.status(500).json({ 
      message: 'Failed to fetch file details',
      error: error.message 
    });
  }
};

// Download a file
exports.downloadFile = async (req, res) => {
  try {
    const fileRecord = await Upload.findById(req.params.id);
    
    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '..', fileRecord.file_path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Update last accessed time
    await Upload.updateLastAccessed(fileRecord.id);
    
    // Set Content-Disposition header to trigger download
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.original_name}"`);
    res.setHeader('Content-Type', fileRecord.file_type);
    
    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      message: 'Failed to download file',
      error: error.message 
    });
  }
};

// Update file description
exports.updateDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    const file = await Upload.findById(id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if user has permission to update
    if (file.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    await Upload.updateDescription(id, description);
    const updatedFile = await Upload.findById(id);
    
    res.status(200).json(updatedFile);
  } catch (error) {
    console.error('Error updating file description:', error);
    res.status(500).json({ 
      message: 'Failed to update file description',
      error: error.message 
    });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await Upload.findById(id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if user has permission to delete
    if (file.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    const filePath = path.join(__dirname, '..', file.file_path);
    
    // Delete from database first
    await Upload.delete(id);
    
    // Then try to delete the file from disk
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsError) {
      console.error('Error deleting file from disk:', fsError);
      // Continue execution even if file deletion fails
    }
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      message: 'Failed to delete file',
      error: error.message 
    });
  }
};