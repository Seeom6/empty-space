import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';
import * as yaml from 'yamljs';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvironmentService } from '@Infrastructure/config/environments';

const normalizePath = (...segments: string[]): string =>
    '/' + segments.map(s => s.replace(/^\/|\/$/g, '')).filter(Boolean).join('/');

export const setupSwagger = (app: NestExpressApplication, env: EnvironmentService): void => {
    const ENABLED_ENVS = ['local', 'dev', 'staging', 'testing'];
    const currentEnv = process.env.NODE_ENV || 'local';
    const prefix = env.get('app.globalPrefix');
    const version = `v${env.get('app.version')}`;
    const host = env.get('app.host');
    const port = env.get('app.port');
    const username = env.get('swagger.userName');
    const config = new DocumentBuilder()
        .setTitle('Cats example')
        .setDescription('The cats API description')
        .setVersion('1.0')
        .addTag('cats')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

};

