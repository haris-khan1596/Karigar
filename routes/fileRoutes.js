const express = require('express');
const { generateUploadUrl, generateDownloadUrl } = require('../controllers/fileController');

const router = express.Router();

// Route to generate a pre-signed URL for uploading a file
router.post('/upload-url', generateUploadUrl);

// Route to generate a pre-signed URL for downloading a file
router.get('/download-url/:filename', generateDownloadUrl);

module.exports = router;
