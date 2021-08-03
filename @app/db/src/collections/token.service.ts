import { Injectable, Inject } from '@nestjs/common';
import { CollectionName, collectionFactory } from './collection.factory';
import { Collection, ObjectId, FilterQuery } from 'mongodb';
import { BaseRecord, Stringifiable, Creatable, ensureCreatedOn } from '../utils/record';
import { ApiProperty } from '@nestjs/swagger';
import { classToPlain } from "class-transformer";

import * as path from 'path';
import debug from 'debug';
import { pkg } from '../utils/environment';
import { Codes } from '../utils/codes';

const log = debug(`${pkg.name}:${path.basename(__filename)}`)

type Record<T = ObjectId> = TokenService.Record<T>;

const COLLECTION = CollectionName.Tokens;

export const collectionProvider = collectionFactory<Record>(COLLECTION, ensureIndexes);
async function ensureIndexes(collection: Collection<Record>) {
    await collection.createIndex({ token: 1, type: 1 }, { unique: true });
    await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }); // Document will be deleted at "expireAt"
}

@Injectable()
export class TokenService {
    constructor(
        @Inject(collectionProvider.provide) private readonly collection: Collection<Record>
    ) { }

    get(_id: ObjectId) {
        return this.collection.findOne({ _id });
    };

    getByToken(token: string, type: TokenService.TokenType) {
        return this.collection.findOne({ token, type });
    };

    findOne(query: FilterQuery<Record>) {
        return this.collection.findOne(query);
    };

    private insertOne(params: Creatable<Record>) {
        const createdOn = new Date();
        return this.collection.insertOne({
            ...params,
            createdOn,
            expireAt: TokenService.getTokenTypeExpirationDate(createdOn, params.type)
        });
    }

    blacklist(_id: ObjectId) {
        return this.collection.findOneAndUpdate({ _id }, { $set: { blacklisted: true } }, { returnOriginal: false });
    }

    getBlacklistedTokens() {
        return this.collection.find({ blacklisted: true }).toArray();
    }

    remove(token: string, type: TokenService.TokenType) {
        return this.collection.deleteOne({ token, type });
    };

    removeRecord(record: Record) {
        const { token, type } = record;
        return this.remove(token, type);
    };

    async generate(accountId: ObjectId, type: TokenService.TokenType, length?: number) {
        // Recursivly insert if failure
        const insert = async (attempt = 0): Promise<Record> => {
            try {
                const params: Parameters<TokenService['create']> = [
                    accountId,
                    type,
                    Codes.generateToken(length),
                ];
                const result = await this.create(...params);
                if (result.insertedCount === 0) throw new Error('Improbable collision.');
                return result.ops[0];
            } catch (error) {
                if (attempt >= 3) throw new Error('Failed to insert record due to multiple insert collisions, how unlucky...');
                attempt++;
                return await insert(attempt);
            }
        }
        return await insert();
    }

    async create(accountId: ObjectId, type: TokenService.TokenType, token: string, _id?: ObjectId, createdOn?: Date) {
        const params: Parameters<TokenService['insertOne']>[0] = {
            _id,
            token,
            accountId,
            type
        };
        return this.insertOne(params);
    }
}


export namespace TokenService {
    export enum TokenType {
        JWT = 'jwt',
        EmailVerification = 'emailVerification',
        PasswordReset = 'passwordReset',
    }

    const tokenExpirationDurationInDays = {
        [TokenType.EmailVerification]: 7,
        [TokenType.PasswordReset]: 3,
        [TokenType.JWT]: 60
    }

    export interface Record<T = ObjectId> extends BaseRecord<T> {
        accountId: T;
        type: TokenType;
        token: string;
        blacklisted?: boolean;
        expireAt: Date;
    }

    export class TokenDbo implements Record<string> {
        @ApiProperty()
        _id: string

        @ApiProperty()
        accountId: string

        @ApiProperty({
            enum: Object.keys(TokenType)
        })
        type: TokenType

        @ApiProperty()
        token: string

        @ApiProperty()
        blacklisted?: boolean;

        @ApiProperty()
        expireAt: Date;

        @ApiProperty()
        createdOn: Date;

        constructor(record: Record<ObjectId>) {
            this._id = record._id.toHexString();
            this.accountId = record.accountId.toHexString();
            this.type = record.type;
            this.token = record.token;
            this.blacklisted = record.blacklisted;
            this.expireAt = record.expireAt;
            this.createdOn = record.createdOn;
        }

        serialize() {
            return classToPlain(this) as Record<string>;
        }
    }

    /**
     * Returns a new expiration date x days in the future where x is determined by [type]
     * @param type 
     */
    export function getTokenTypeExpirationDate(createdOn: Date, type: TokenType) {
        const date = new Date(createdOn);
        date.setDate(date.getDate() + tokenExpirationDurationInDays[type]);
        return date;
    }

    export function isTokenExpired<T>(record: Record<T>) {
        return new Date() > getTokenTypeExpirationDate(record.createdOn, record.type)
    }
}