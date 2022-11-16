import { Injectable, Inject } from '@nestjs/common';
import { CollectionName, collectionFactory } from './collection.factory';
import { Collection, ObjectId, Filter, WithoutId, WithId } from 'mongodb';
import { BaseRecord, Stringifiable, Creatable, ensureCreatedOn } from '../utils/record';
import { ApiProperty } from '@nestjs/swagger';
import { classToPlain } from "class-transformer";

import { Codes } from '../utils/codes';

import { pkg } from '../utils/environment';
import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

type Record = WithoutId<TokenCollection.Record>;

const COLLECTION = CollectionName.Tokens;

export const collectionProvider = collectionFactory<Record>(COLLECTION, ensureIndexes);
async function ensureIndexes(collection: Collection<Record>) {
    await collection.createIndex({ token: 1, type: 1 }, { unique: true });
    await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }); // Document will be deleted at "expireAt"
}

@Injectable()
export class TokenCollection {
    constructor(
        @Inject(collectionProvider.provide) private readonly collection: Collection<Record>
    ) { }

    get(_id: ObjectId) {
        return this.collection.findOne({ _id });
    };

    getByToken(token: string, type: TokenCollection.TokenType) {
        return this.collection.findOne({ token, type });
    };

    findOne(query: Filter<Record>) {
        return this.collection.findOne(query);
    };

    private async insertOne(params: Creatable<Record>): Promise<WithId<Record>> {
        const createdOn = new Date();
        const record = {
            ...params,
            createdOn,
            expireAt: TokenCollection.getTokenTypeExpirationDate(createdOn, params.type)
        };
        const { insertedId } = await this.collection.insertOne(record);
        return {
            _id: insertedId,
            ...record
        }
    }

    blacklist(_id: ObjectId) {
        return this.collection.findOneAndUpdate({ _id }, { $set: { blacklisted: true } }, { returnDocument: 'after' });
    }

    getBlacklistedTokens() {
        return this.collection.find({ blacklisted: true }).toArray();
    }

    remove(token: string, type: TokenCollection.TokenType) {
        return this.collection.deleteOne({ token, type });
    };

    removeRecord(record: Record) {
        const { token, type } = record;
        return this.remove(token, type);
    };

    async generate(accountId: ObjectId, type: TokenCollection.TokenType, length?: number) {
        // Recursivly insert if failure
        const insert = async (attempt = 0): Promise<Record> => {
            try {
                const params: Parameters<TokenCollection['create']> = [
                    accountId,
                    type,
                    Codes.generateToken(length),
                ];
                const result = await this.create(...params);
                return result;
            } catch (error) {
                if (attempt >= 3) throw new Error('Failed to insert record due to multiple insert collisions, how unlucky...');
                attempt++;
                return await insert(attempt);
            }
        }
        return await insert();
    }

    async create(accountId: ObjectId, type: TokenCollection.TokenType, token: string, _id?: ObjectId, createdOn?: Date) {
        const params: Parameters<TokenCollection['insertOne']>[0] = {
            _id,
            token,
            accountId,
            type
        };
        return this.insertOne(params);
    }
}


export namespace TokenCollection {
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