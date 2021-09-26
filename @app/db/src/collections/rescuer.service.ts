import { Injectable, Inject } from '@nestjs/common';
import { CollectionName, collectionFactory } from './collection.factory';
import { Collection, ObjectId, FilterQuery, MatchKeysAndValues } from 'mongodb';
import { BaseRecord, Stringifiable, Creatable, ensureCreatedOn } from '../utils/record';
import { ApiProperty } from '@nestjs/swagger';

import * as path from 'path';
import debug from 'debug';
import { pkg } from '../utils/environment';
const log = debug(`${pkg.name}:${path.basename(__filename)}`)

type Record = RescuerService.Record;

const COLLECTION = CollectionName.Rescuer;

export const collectionProvider = collectionFactory<Record>(COLLECTION, ensureIndexes);
async function ensureIndexes(collection: Collection<Record>) {
    // await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
}

@Injectable()
export class RescuerService {
    constructor(
        @Inject(collectionProvider.provide) private readonly collection: Collection<Record>
    ) { }

    get(_id: ObjectId) {
        return this.collection.findOne({ _id });
    };


    list() {
        return this.collection.find().toArray();
    };

    findOne(query: FilterQuery<Record>) {
        return this.collection.findOne(query);
    };

    insertOne(params: Creatable<Record>) {
        return this.collection.insertOne(ensureCreatedOn(params));
    }

    updateProfilePicture(_id: ObjectId, params: Pick<Record, 'profilePicureFile'>) {
        const { profilePicureFile } = params;
        return this.collection.updateOne({ _id }, { $set: { profilePicureFile } });
    };
}
export namespace RescuerService {
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
    // TODO - make rescuerService for database record (1)
    // Need one of these for every single collection

    export class RescuerDbo implements Omit<Record<string>, 'passwordHash' | 'passwordSalt'> {
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


}