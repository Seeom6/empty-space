import { Injectable } from '@nestjs/common';

@Injectable()
export class FileUrlService {
  generate({
    filename,
    storageFilePath,
  }: {
    filename: string;
    storageFilePath: string;
  }) {
    return (
      process.env.SERVER_URL +
      process.env.FILE_URL_PREFIX +
      storageFilePath +
      filename
    );
  }
}