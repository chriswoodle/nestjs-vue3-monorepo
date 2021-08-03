import { ObjectId } from 'mongodb';
export interface JwtClaims<T = ObjectId, U = Date> {
    jti: T; // Unique Id of jwt
    issuer: string; // principal that issued the token
    accountId: T; // Account Id
    exp: U; // When the token expires
    iat: U; // When the token was issued
}

declare global {
    namespace Express {
        interface Request {
            claims?: JwtClaims<string, number>
        }
    }
}