const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
});

class CloudinaryService {
    // Upload image to Cloudinary
    async uploadImage(file, folder = 'user-profiles') {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: folder,
                resource_type: 'auto'
            });
            
            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete image from Cloudinary
    async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return {
                success: true,
                result: result
            };
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update image (delete old and upload new)
    async updateImage(file, oldPublicId = null, folder = 'user-profiles') {
        try {
            // Delete old image if exists
            if (oldPublicId) {
                await this.deleteImage(oldPublicId);
            }

            // Upload new image
            return await this.uploadImage(file, folder);
        } catch (error) {
            console.error('Cloudinary update error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new CloudinaryService(); 