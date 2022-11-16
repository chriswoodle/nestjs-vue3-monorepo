import { Injectable, Inject } from '@nestjs/common';
import { CollectionName, collectionFactory } from './collection.factory';
import { Collection, ObjectId, MatchKeysAndValues, Filter, WithId, WithoutId } from 'mongodb';
import { BaseRecord, Stringifiable, Creatable, ensureCreatedOn } from '../utils/record';
import { ApiProperty } from '@nestjs/swagger';

import { pkg } from '../utils/environment';
import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

type Record = WithoutId<AccountCollection.Record>;

const COLLECTION = CollectionName.Accounts;

export const collectionProvider = collectionFactory<Record>(COLLECTION, ensureIndexes);
async function ensureIndexes(collection: Collection<Record>) {
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
}

@Injectable()
export class AccountCollection {
    constructor(
        @Inject(collectionProvider.provide) private readonly collection: Collection<Record>
    ) { }

    get(_id: ObjectId) {
        return this.collection.findOne({ _id });
    };

    getByEmail(email: string) {
        return this.collection.findOne({ email });
    };

    list() {
        return this.collection.find().toArray();
    };

    findOne(query: Filter<Record>) {
        return this.collection.findOne(query);
    };

    async insertOne(params: Creatable<Record>): Promise<WithId<Record>> {
        const record = ensureCreatedOn(params);
        const { insertedId } = await this.collection.insertOne(record);
        return {
            _id: insertedId,
            ...record
        }
    }

    updateInfo(_id: ObjectId, params: Partial<Pick<Record, 'nickname'>>) {
        const { nickname } = params;
        const set: MatchKeysAndValues<Record> = {
            nickname
        };
        return this.collection.updateOne({ _id }, { $set: set });
    };

    updateEmailVerfied(_id: ObjectId, state: boolean) {
        return this.collection.updateOne({ _id }, { $set: { verifiedEmail: state } });
    };

    updatePassword(record: WithId<Record>, params: Pick<Record, 'passwordHash' | 'passwordSalt'>) {
        const { passwordHash, passwordSalt } = params;
        return this.collection.updateOne({ _id: record._id }, { $set: { passwordHash, passwordSalt } });
    };

    updateProfilePicture(_id: ObjectId, params: Pick<Record, 'profilePicureFile'>) {
        const { profilePicureFile } = params;
        return this.collection.updateOne({ _id }, { $set: { profilePicureFile } });
    };
}
export namespace AccountCollection {
    export interface Record<T = ObjectId> extends BaseRecord<T> {
        email: string;
        verifiedEmail?: boolean;
        nickname?: string;
        passwordHash: string;
        passwordSalt: string;
        profilePicureFile?: string;
        remoteProfilePictureUrl?: string;
        birthday: string;
        gender: string;
        phoneNumber: string;
    }

    export class AccountDbo implements Omit<Record<string>, 'passwordHash' | 'passwordSalt'> {
        @ApiProperty()
        _id: string;

        @ApiProperty()
        email: string;

        @ApiProperty()
        verifiedEmail?: boolean

        @ApiProperty()
        nickname?: string;

        @ApiProperty()
        profilePicureFile?: string;

        @ApiProperty()
        remoteProfilePictureUrl?: string;

        @ApiProperty()
        phoneNumber!: string;

        @ApiProperty()
        birthday!: string;

        @ApiProperty()
        gender!: string;

        @ApiProperty()
        createdOn: Date;

        constructor(record: Record<ObjectId>) {
            this._id = record._id.toHexString();
            this.email = record.email;
            this.verifiedEmail = record.verifiedEmail;
            this.nickname = record.nickname;
            this.profilePicureFile = record.profilePicureFile;
            this.remoteProfilePictureUrl = record.remoteProfilePictureUrl;
            this.birthday = record.birthday;
            this.gender = record.gender;
            this.birthday = record.birthday;
            this.createdOn = record.createdOn;
        }
    }

    export class UserDbo implements Omit<Record<string>, 'passwordHash' | 'passwordSalt' | 'email' | 'verifiedEmail' | 'birthday' | 'gender' | 'phoneNumber'> {
        @ApiProperty()
        _id: string;

        @ApiProperty()
        nickname?: string;

        @ApiProperty()
        profilePicureFile?: string;

        @ApiProperty()
        remoteProfilePictureUrl?: string;

        @ApiProperty()
        createdOn: Date;

        constructor(record: Record<ObjectId>) {
            this._id = record._id.toHexString();
            this.nickname = record.nickname;
            this.profilePicureFile = record.profilePicureFile;
            this.remoteProfilePictureUrl = record.remoteProfilePictureUrl;
            this.createdOn = record.createdOn;
        }
    }
}