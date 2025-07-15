import { Controller, Post, UploadedFile, Route, Tags } from '@tsoa/runtime';
import { inject } from 'inversify';
import { IStorageService } from '../services/IStorageService';
import { Types } from '../configs/ioc.types';
import { provide } from 'inversify-binding-decorators';

@provide(UploadController)
@Route('upload')
@Tags('Upload')
export class UploadController extends Controller {
  constructor(@inject(Types.IStorageService) private storageService: IStorageService) {
    super();
  }

  /**
   * Upload an image or voice note
   * @param file The file to upload (image or audio)
   */
  @Post('/')
  public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ path: string }> {
    console.log('Received file', file.originalname);
    const savedPath = await this.storageService.saveFile(file);
    return { path: savedPath };
  }
}
