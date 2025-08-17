import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EnvironmentService } from '@Infrastructure/config';


  export const JWTModule = JwtModule.registerAsync({
  inject: [EnvironmentService],
  useFactory: (envService: EnvironmentService) => {
    return {
      secret: envService.get("jwt.jwtAccessSecret"),
    }
  }
})



export namespace JWTModules {
  export const JWTModule = JwtModule.registerAsync({
  inject: [EnvironmentService],
  useFactory: (envService: EnvironmentService) => {
    return {
      secret: envService.get("jwt.jwtAccessSecret"),
      signOptions: {
        expiresIn: envService.get("jwt.jwtExpiredAccess"),
      }
    }
  }
})


  export const JWTUnExpierdModule = JwtModule.registerAsync({
    inject: [EnvironmentService],
    useFactory: (envService: EnvironmentService) => {
      return {
        secret: envService.get("jwt.jwtAccessSecret")
      }
    }
  })
}