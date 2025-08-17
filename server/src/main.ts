import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvironmentService } from '@Infrastructure/config';
import { nestjsFilter } from '@Package/error';
import { nestConfig } from '@Infrastructure/config/nest.config';
import { setupSwagger } from '@Package/doc/swagger/swagger.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Use Winston as the main logger for NestJS
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  const envService = app.get(EnvironmentService);

  nestjsFilter(app);
  await nestConfig(app, envService);

  const port = envService.get("app.port");
  
  setupSwagger(app, envService);
  await app.listen(port).then(()=>{});
  console.log(`\n🚀 Server running on http://${envService.get("app.host")}:${port}`);
  
}

void bootstrap();
