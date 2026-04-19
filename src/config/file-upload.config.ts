// file-upload.config.ts
import { diskStorage } from 'multer';
import { Request } from 'express';
import { appConfig } from './app.config';

export const profilePictureUploadConfig = {
  preservePath: true,
  fileFilter: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, accept: boolean) => void,
  ) => {
    cb(null, true);
  },
  storage: diskStorage({
    destination: `${appConfig().files.filesPath}/profiles`,
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const extension = file.originalname.split('.').pop();
      const timestamp = Date.now();
      const newName = `${
        file.originalname.replace(/\s/g, '_').split('.')[0]
      }-${timestamp}.${extension}`;
      cb(null, newName);
    },
  }),
  limits: {
    fileSize: parseInt(appConfig().files.uploadLimit) * 1024 * 1024,
  },
};
