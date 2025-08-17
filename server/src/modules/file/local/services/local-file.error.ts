import { Injectable } from "@nestjs/common";
import { AppError, ErrorFactory, IError, IServiceError } from "@Package/error";
import { ErrorCode } from "../../../../common/error/error-code";

const OurServiceErrorMessages = {
  [ErrorCode.FILE_NOT_FOUND]: 'File not found',
  [ErrorCode.FILE_ALREADY_EXISTS]: 'File already exists',
  [ErrorCode.FILE_NOT_UPLOADED]: 'File not uploaded',
};

@Injectable()
export class LocalFileError extends IServiceError {
  
  constructor(){
    super(OurServiceErrorMessages, LocalFileError.name)
  }

}
