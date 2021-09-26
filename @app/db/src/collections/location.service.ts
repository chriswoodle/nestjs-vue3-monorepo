// Create data up there

// TODO Muntaser
// Format of data in the database


// Directions Tables (COMMMANDS)
// { timestamp, left/right/up}

// Service Dog Table (SETTINGS)
// isAuto 

// Alarm Data (FIRE SOUND)
// timestamp, type: fire/sound, coordinate system (0,1000)

// Sensor Data ( long lat)
// timestamp, long, lat

// Location table (GPS)
// last GPS coordinates timestamp

import { Injectable, Inject } from '@nestjs/common';
import { CollectionName, collectionFactory } from './collection.factory';
import { Collection, ObjectId, FilterQuery, MatchKeysAndValues } from 'mongodb';
import { BaseRecord, Stringifiable, Creatable, ensureCreatedOn } from '../utils/record';
import { ApiProperty } from '@nestjs/swagger';

import * as path from 'path';
import debug from 'debug';
import { pkg } from '../utils/environment';
const log = debug(`${pkg.name}:${path.basename(__filename)}`)

type Record = LocationService.Record;

const COLLECTION = CollectionName.Rescuer;

export const collectionProvider = collectionFactory<Record>(COLLECTION, ensureIndexes);
async function ensureIndexes(collection: Collection<Record>) {
    // await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
}

@Injectable()
export class LocationService {
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

}
export namespace LocationService {
    export interface Record<T = ObjectId> extends BaseRecord<T> {
        timestamp?: string;
        long?: number;
        lat?: number;
        coordX?: number;
        coordY?: number;
        coordInstance?: number;
    }
    // TODO - make LocationService for database record (1)
    // Need one of these for every single collection

    export class CommandDbo implements Omit<Record<string>, 'passwordHash' | 'passwordSalt'> {
        @ApiProperty()
        _id: string;

        @ApiProperty()
        timestamp?: string

        @ApiProperty()
        long?: number

        @ApiProperty()
        lat?: number

        @ApiProperty()
        coordX?: number

        @ApiProperty()
        coordY?: number

        @ApiProperty()
        coordInstance?: number

        @ApiProperty()
        createdOn: Date;

        constructor(record: Record<ObjectId>) {
            this._id = record._id.toHexString();
            this.timestamp = record.timestamp;
            this.long = record.long;
            this.lat = record.lat;
            this.coordX = record.coordX;
            this.coordY = record.coordY;
            this.coordInstance = record.coordInstance;
            this.createdOn = record.createdOn;
        }
        updatedOn?: Date | undefined;
    }


}