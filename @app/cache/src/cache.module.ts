import { Module } from '@nestjs/common';
import { TokenCache } from './token.cache';
import { DatabaseModule } from '@app/db';

@Module({
    providers: [
        TokenCache
    ],
    imports: [
        DatabaseModule
    ],
    exports: [
        TokenCache
    ]
})
export class CacheModule { }
