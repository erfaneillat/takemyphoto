import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadedFile {
  url: string;
  publicId: string;
}

export interface IFileUploadService {
  uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadedFile>;
  uploadImages(files: Express.Multer.File[], folder?: string): Promise<UploadedFile[]>;
  deleteImage(publicId: string): Promise<void>;
  deleteImages(publicIds: string[]): Promise<void>;
}

export class CloudinaryFileUploadService implements IFileUploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'nero'): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async uploadImages(files: Express.Multer.File[], folder: string = 'nero'): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Error deleting images:', error);
      throw new Error('Failed to delete images');
    }
  }
}
