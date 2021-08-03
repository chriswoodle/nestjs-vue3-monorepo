
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtClaims } from './types';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

const jwtClaimContextDecorator = (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const jti = new ObjectId(request.claims!.jti);
    const accountId = new ObjectId(request.claims!.accountId);
    const claims: JwtClaims = {
        ...request.claims!,
        jti,
        accountId,
        exp: new Date(request.claims!.exp * 1000),
        iat: new Date(request.claims!.iat * 1000)
    };
    return claims;
};    
    
export const JwtClaimFromContext = createParamDecorator(jwtClaimContextDecorator);