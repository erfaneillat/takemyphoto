import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export interface SavedRemoteImage {
  url: string; // public URL served by /uploads
  publicId: string; // relative path within uploads for potential deletion
  filePath: string; // absolute file path on disk
}

export interface IRemoteImageService {
  downloadToUploads(remoteUrl: string, folder?: string): Promise<SavedRemoteImage>;
}

export class RemoteImageService implements IRemoteImageService {
  private uploadsRoot = path.resolve(process.cwd(), 'uploads');

  async downloadToUploads(remoteUrl: string, folder: string = 'nero/generated'): Promise<SavedRemoteImage> {
    const res = await axios.get<ArrayBuffer>(remoteUrl, { responseType: 'arraybuffer' });

    // Determine extension
    const contentType = res.headers['content-type'] as string | undefined;
    let ext = this.getExtFromContentType(contentType) || this.getExtFromUrl(remoteUrl) || 'jpg';

    // Prepare paths
    const dir = path.join(this.uploadsRoot, folder);
    await fs.mkdir(dir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const filePath = path.join(dir, filename);

    // Write file
    await fs.writeFile(filePath, Buffer.from(res.data));

    // Public URL served by express static /uploads
    const publicPath = `/uploads/${folder}/${filename}`.replace(/\\/g, '/');

    return {
      url: publicPath,
      publicId: `${folder}/${filename}`,
      filePath
    };
  }

  private getExtFromContentType(ct?: string): string | null {
    if (!ct) return null;
    if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return 'jpg';
    if (ct.includes('image/png')) return 'png';
    if (ct.includes('image/webp')) return 'webp';
    if (ct.includes('image/gif')) return 'gif';
    return null;
    }

  private getExtFromUrl(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const m = pathname.match(/\.([a-zA-Z0-9]+)$/);
      return m ? m[1].toLowerCase() : null;
    } catch {
      return null;
    }
  }
}
