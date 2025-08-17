import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { ConfigService } from '@nestjs/config';
import { MediaPath } from '../types/media-path.enum';
import { EnvConfigModule, EnvironmentService } from '@Infrastructure/config';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [EnvConfigModule],
      useFactory: async (environmentService: EnvironmentService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadPath = join(process.cwd(), 'public', 'media', MediaPath.IMAGE, req.params.imageFolder);
            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = file.originalname.split('.').pop();
            cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
          },
        }),
        limits: {
          fileSize: environmentService.get('file.maxFileSize', 5 * 1024 * 1024), 
        },
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
          }
          cb(null, true);
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {} 