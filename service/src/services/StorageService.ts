import fs from 'fs';
import path from 'path';
import { injectable } from 'inversify';
import { IStorageService } from './IStorageService';

@injectable()
export class StorageService implements IStorageService {
  private storageDir: string;

  constructor(storageDir: string = path.resolve(__dirname, '../../storage')) {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  public async saveFile(file: Express.Multer.File): Promise<string> {
    const destPath = path.join(this.storageDir, file.originalname);
    await fs.promises.rename(file.path, destPath);
    return destPath;
  }
}
