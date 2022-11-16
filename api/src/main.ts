import { NestApplication } from '@nestjs/core';
import { ValidationPipe, HttpAdapterHost } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import path from 'path';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { pkg, env } from './utils/environment';
import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

const MORGAN_FORMAT = ':method :url :status :res[content-length] - :response-time ms';

async function bootstrap() {
    log(`Starting app version: ${pkg.version}`)
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(morgan(MORGAN_FORMAT))
    app.enableCors();
    app.use(helmet());
    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
        }),
    );
    app.set('trust proxy', 1);
    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle('API')
        .setDescription('API')
        .setVersion(pkg.version)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    SwaggerModule.setup('/', app, document);

    if (env.GENERATE_SPEC) {
        log('Generating OpenAPI Spec...');
        const output = path.resolve(__filename, '../../docs/');
        fs.mkdirSync(output, { recursive: true });
        fs.writeFileSync(path.resolve(output, 'api-json.json'), JSON.stringify(document));
        log('Generating OpenAPI Spec complete.');
        app.close();
        return;
    }

    await app.listen(env.PORT);
    log(`App listening on port: ${env.PORT}`);
}
bootstrap();
