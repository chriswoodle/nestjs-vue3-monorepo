// Create data up there

// TODO Muntaser
// Format of data in the database


// Directions Tables (COMMMANDS)
// { timestamp, left/right/up}

// Service Dog Table (SETTINGS)
// isAuto 

// Alarm Data (FIRE SOUND)
// timestamp, type: fire/sound, coordinate system (0,1000)

// Sensor Data ( SMOKE TEMPERATURE)
// timestamp, smoke, temperature

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

type Record = SensorService.Record;

const COLLECTION = CollectionName.Rescuer;

export const collectionProvider = collectionFactory<Record>(COLLECTION, ensureIndexes);
async function ensureIndexes(collection: Collection<Record>) {
    // await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
}

@Injectable()
export class SensorService {
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
export namespace SensorService {
    export interface Record<T = ObjectId> extends BaseRecord<T> {
        timestamp?: string;
        smoke?: number;
        temperature?: number;
        co2?: number;
    }
    // TODO - make SensorService for database record (1)
    // Need one of these for every single collection

    export class CommandDbo implements Omit<Record<string>, 'passwordHash' | 'passwordSalt'> {
        @ApiProperty()
        _id: string;

        @ApiProperty()
        timestamp?: string

        @ApiProperty()
        smoke?: number

        @ApiProperty()
        temperature?: number

        @ApiProperty()
        co2?: number

        @ApiProperty()
        createdOn: Date;

        constructor(record: Record<ObjectId>) {
            this._id = record._id.toHexString();
            this.timestamp = record.timestamp;
            this.smoke = record.smoke;
            this.temperature = record.temperature;
            this.co2 = record.co2;
            this.createdOn = record.createdOn;
        }
        updatedOn?: Date | undefined;
    }


}