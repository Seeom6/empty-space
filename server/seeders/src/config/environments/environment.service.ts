import { EnumEnvironment } from './interfaces/env.enum';
import { IEnv } from './env';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const getCurrentEnv = ():EnumEnvironment=>{
  const env = process.env.NODE_ENV
  if(!Object.values<string>(EnumEnvironment).includes(env)){
    throw new Error("environment must be in ['development','production','local','test']")
  }
  return env as EnumEnvironment
}

export type Leaves<T> = T extends object
  ? {
    [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never
      ? ''
      : `.${Leaves<T[K]>}`}`;
  }[keyof T]
  : never;

export type LeafTypes<T, S extends string> = S extends `${infer T1}.${infer T2}`
  ? T1 extends keyof T
    ? LeafTypes<T[T1], T2>
    : never
  : S extends keyof T
    ? T[S]
    : never;

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {
  }
    public get<T extends Leaves<IEnv>>(path: T, insteadValue?: LeafTypes<IEnv, T>): LeafTypes<IEnv, T> {
      return this.configService.get(path) ?? insteadValue;
  }
}
