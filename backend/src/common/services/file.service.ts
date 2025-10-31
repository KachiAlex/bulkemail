import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class FileService {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await mkdirAsync(this.uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Save uploaded file
   */
  async saveFile(file: Express.Multer.File, subDir?: string): Promise<string> {
    const dir = subDir ? path.join(this.uploadDir, subDir) : this.uploadDir;
    await mkdirAsync(dir, { recursive: true });
    
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(dir, filename);
    
    await fs.promises.writeFile(filepath, file.buffer);
    
    return filepath;
  }

  /**
   * Delete file
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      await unlinkAsync(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Read file
   */
  async readFile(filepath: string): Promise<Buffer> {
    return fs.promises.readFile(filepath);
  }

  /**
   * Check if file exists
   */
  async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.promises.access(filepath);
      return true;
    } catch {
      return false;
    }
  }
}

