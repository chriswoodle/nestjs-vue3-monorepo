import { Request } from 'express';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenCache } from '@app/cache';

import { pkg } from './utils/environment';
import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly tokenCache: TokenCache,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        let authorization = request.headers['authorization'];
        if (!authorization) {
            throw new UnauthorizedException('authorization header is missing');
        }

        authorization = authorization.trim().replace(/\s\s+/g, ' '); // Replace any duplicate spaces
        const parts = authorization.split(' ');
        const bearer = parts[0];
        const token = parts[1];

        if (!bearer || bearer.toLocaleLowerCase() !== 'bearer') {
            throw new UnauthorizedException('authorization header should start with "bearer "');
        }

        if (!token) {
            throw new UnauthorizedException('token invalid');
        }

        let claims;
        try {
            claims = await this.authService.verifyToken(token);
        } catch (error) {
            log(error);
            throw new UnauthorizedException('token error');
        }

        if (!claims) {
            throw new UnauthorizedException('token failed to verify');
        }
        request.claims = claims;

        const blacklisted = await this.tokenCache.isBlacklisted(claims.jti);
        if (blacklisted) throw new UnauthorizedException('token is blacklisted');

        return true;
    }
}