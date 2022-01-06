import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { Collections } from '@app/db';

import { pkg } from './utils/environment';

import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

const TOKEN_PREFIX = 'token:';

@Injectable()
export class TokenCache {
    public tokens: {
        [tokenId: string]: Collections.TokenCollection.Record<string>
    } = {};
    constructor(
        private readonly tokenCollection: Collections.TokenCollection
    ) { }

    async isBlacklisted(tokenId: string) {
        const key = this.formatKey(tokenId);
        let cached = this.tokens[key];
        if (!cached) {
            log('cache miss')
            const id = new ObjectId(tokenId);
            const record = await this.tokenCollection.get(id);
            log('record');
            log(record);
            if (!record) return true;
            this.cacheToken(record);
            cached = this.tokens[key];
            log('cached');
            log(cached);
        }
        return !!cached.blacklisted;
    }

    uncacheToken(tokenid: ObjectId) {
        const key = this.formatKey(tokenid.toHexString());
        log('cache removed', key);
        delete this.tokens[key];
    }

    cacheToken(token: Collections.TokenCollection.Record) {
        const key = this.formatKey(token._id.toHexString());
        this.tokens[key] = (new Collections.TokenCollection.TokenDbo(token)).serialize();
        log(this.tokens[key]);
    }

    private formatKey(key: string) {
        return `${TOKEN_PREFIX}${key}`;
    }
}