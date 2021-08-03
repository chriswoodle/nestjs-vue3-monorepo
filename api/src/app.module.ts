import { Module } from '@nestjs/common';

import { AuthModule } from '@app/auth';
import { DatabaseModule } from '@app/db';
import { CacheModule } from '@app/cache';

import { controllers } from './controllers';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        CacheModule,
    ],
    controllers: [
        ...controllers,
    ],
    providers: [
    ],
})
export class AppModule { }
