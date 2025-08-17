
export interface IError {
  message: string | object;
  code: number;
  statusCode?: number
  errorType?: string;

}

export interface IResponseError extends IError {
  path: string;
  time: Date;
}

export type ErrorMessages = Record<number, string>;
