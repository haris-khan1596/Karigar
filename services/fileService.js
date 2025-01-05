const AWS = require('aws-sdk')

// Initialize the Wasabi S3
const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://s3.wasabisys.com'),
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  region: 'ap-southeast-1'
})

/**
 * Generates a pre-signed URL for uploading files to Wasabi.
 * @param {string} filePath - The file's path within the bucket.
 * @param {string} mimeType - The file's MIME type.
 * @returns {Promise<string>} - A promise that resolves to the pre-signed URL.
 */
const createUploadPresignedUrl = async (filePath, mimeType, expires = 5) => {
  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: filePath,
    Expires: expires * 60,
    ContentType: mimeType 
  }

  return await s3.getSignedUrlPromise('putObject', params)
}

/**
 * Generates a pre-signed URL for downloading files from Wasabi.
 * @param {string} filePath - The file's path within the bucket.
 * @returns {Promise<string>} - A promise that resolves to the pre-signed URL.
 */
const createDownloadPresignedUrl = async (filePath, expires = 5) => {
  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: filePath,
    Expires: expires * 60
  }

  return await s3.getSignedUrlPromise('getObject', params)
}

module.exports = {
  createUploadPresignedUrl,
  createDownloadPresignedUrl
}
