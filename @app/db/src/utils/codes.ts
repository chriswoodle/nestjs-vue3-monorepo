import * as crypto from 'crypto';

export const GENERATED_TOKEN_LENGTH = 256;
export const SHORT_CODE_LENGTH = 6;
const SHORT_CODE_CHAR_SET = '123456789abcdefghijkmnopqrstuvwxyz' // 1-9 and aplhabet without 'l'

export namespace Codes {
    export function generateToken(length?: number) {
        return crypto.randomBytes(length || GENERATED_TOKEN_LENGTH / 2).toString('hex');
    }

    export function generateShortCode() {
        let result = '';
        for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
            result += SHORT_CODE_CHAR_SET.charAt(Math.floor(Math.random() * SHORT_CODE_CHAR_SET.length));
        }
        return result;
    }
}