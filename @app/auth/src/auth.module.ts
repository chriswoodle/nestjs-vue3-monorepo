import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CacheModule } from '@app/cache';
@Module({
    providers: [
        AuthService,
        AuthGuard,
    ],
    exports: [
        AuthService,
        AuthGuard,
    ],
    imports: [
        CacheModule
    ]
})
export class AuthModule { }
