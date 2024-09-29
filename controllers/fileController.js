const { createUploadPresignedUrl, createDownloadPresignedUrl } = require('../services/fileService');

/**
 * Controller for generating a pre-signed URL for uploading files.
 * This method will return a pre-signed URL that the client can use to upload files to Wasabi.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const generateUploadUrl = async (req, res) => {
  try {
    const { filename, mimeType } = req.body;

    // Validate required fields
    if (!filename || !mimeType) {
      return res.status(400).json({ error: 'Filename and MIME type are required' });
    }

    const filePath = `uploads/${filename}`; 
    const url = await createUploadPresignedUrl(filePath, mimeType); 

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error generating upload presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

/**
 * Controller for generating a pre-signed URL for downloading files.
 * This method will return a pre-signed URL that the client can use to fetch files from Wasabi.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const generateDownloadUrl = async (req, res) => {
  try {
    const { filename } = req.params;

    // Validate required field
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const filePath = `uploads/${filename}`; 
    const url = await createDownloadPresignedUrl(filePath);

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error generating download presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};

module.exports = {
  generateUploadUrl,
  generateDownloadUrl
};
