import * as joi from 'joi'
import { GetEnv, IEnv } from '../env';
import { IDatabaseEnv } from '../interfaces/database.inteface';
import { IAppEnv } from '../interfaces/app.interface';
import { TwelveEnv } from '../interfaces/twelve.interface';

export const devValidationSchema =()=>{
  const schema =joi.object<IEnv>({
    app: joi.object<IAppEnv>({
      port: joi.number().required(),
      host: joi.string().required(),
      name: joi.string().required(),
      baseUrl: joi.string().required(),
      version: joi.number().required(),
      globalPrefix: joi.string().required(),
      defaultLanguage: joi.string().required()
    }).required(),
    mongodb: joi.object<IDatabaseEnv>({
      host: joi.string().required(),
      port: joi.number().required(),
      password: joi.string(),
      username: joi.string(),
      name: joi.string().required(),
    }).required(),
    jwt:  joi.object({
      jwtAccessSecret: joi.string().required(),
      jwtRefreshSecret: joi.string(),
      jwtExpiredRefresh: joi.string(),
      jwtExpiredAccess: joi.string().required(),
      ttlRefreshToken: joi.number().required()
    }).required(),
    mail: joi.object({
      host: joi.string().required(),
      port: joi.number().required(),
      user: joi.string().required(),
      password: joi.string().required(),
      from: joi.string()
    }).required(),
    redis: joi.object({
      host: joi.string().required(),
      port: joi.number().required(),
      databaseIndex: joi.number().required(),
      password: joi.string().allow(""),
      name: joi.string().required(),
    }).required(),
    file: joi.object({
      maxFileSize: joi.number().required(),
      baseUrl: joi.string().required(),
    }).required(),
    twelve: joi.object<TwelveEnv>({
      apiKye: joi.string().required(),
      baseUrl: joi.string().required()
    }),
    swagger: joi.object({
      password: joi.string().required(),
      userName: joi.string().required()
    })
  })
  return schema;
}


