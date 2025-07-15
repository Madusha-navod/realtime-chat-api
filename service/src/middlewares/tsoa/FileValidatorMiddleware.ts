import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
   destination: function (_req, _file, cb) {
      cb(null, path.resolve(__dirname, '../../../storage'));
   },
   filename: function (_req, file, cb) {
      cb(null, file.originalname);
   }
});

const upload = multer({ storage });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function validateFile(req: Request, res: Response, next: NextFunction): Promise<any> {
   const multerSingle = upload.single('file');
   return multerSingle(req, res, function () {
      console.log('validateFile req.file:', req.file); // Debug log
      if (req.file === undefined) {
         return res.status(HttpStatusCode.UnprocessableEntity).json({ error: 'File is required' });
      }
      next();
   });
}

export { upload };
