import * as fs from 'fs';
import * as path from 'path';

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

export class LocalFileUploadService implements IFileUploadService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  private ensureUploadsDir(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'general'): Promise<UploadedFile> {
    const folderPath = path.join(this.uploadsDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const filepath = path.join(folderPath, filename);

    fs.writeFileSync(filepath, file.buffer);

    const url = `/uploads/${folder}/${filename}`;
    const publicId = `${folder}/${filename}`;

    return {
      url,
      publicId
    };
  }

  async uploadImages(files: Express.Multer.File[], folder: string = 'general'): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const filepath = path.join(this.uploadsDir, publicId);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    try {
      for (const publicId of publicIds) {
        await this.deleteImage(publicId);
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      throw new Error('Failed to delete images');
    }
  }
}
