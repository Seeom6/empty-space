import { ConfigModule } from "@nestjs/config";
import { EnvironmentService } from './environment.service';
import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { GetEnv } from "./env";
import { devValidationSchema } from "./validation/env.validation";


export const AppEnvConfig = ConfigModule.forRoot({
   envFilePath: `${process.cwd()}/../.env`,
   isGlobal: true,
   load: [() => {
      const env = GetEnv();
      // const { error } = devValidationSchema().validate(env, { abortEarly: false });
      // if (error) {
      //    throw new Error(`Config validation error:\n${error.message}`);
      // }
      return env;
   }],
})

@Global()
@Module({
   imports: [AppEnvConfig],
   providers: [EnvironmentService],
   exports: [EnvironmentService],
})
export class EnvConfigModule implements OnModuleInit {
   constructor(private readonly environmentService: EnvironmentService) { }
   onModuleInit(): any {
      setEnvironmentService(this.environmentService);
   }
}

let environmentServiceInstance: EnvironmentService;

export function setEnvironmentService(service: EnvironmentService) {
   environmentServiceInstance = service;
}

export function getEnvService(): EnvironmentService {
   if (!environmentServiceInstance) {
      throw new Error('EnvironmentService is not set. Make sure you initialized it in a module.');
   }
   return environmentServiceInstance;
}