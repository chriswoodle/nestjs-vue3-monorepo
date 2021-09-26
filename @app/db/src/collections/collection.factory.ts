import * as path from 'path';
import debug from 'debug';
import { pkg } from '../utils/environment';
import { Collection } from 'mongodb';
const log = debug(`${pkg.name}:${path.basename(__filename)}`)

import { DatabaseService } from '../database.service';

export enum CollectionName {
    Accounts = 'accounts',
    Tokens = 'tokens',
    Rescuer = 'rescuer',
    Commands = 'commands'
}

export function collectionFactory<T>(collectionName: CollectionName, ensureIndexes: (collection: Collection<T>) => void) {
    return {
        provide: `COLLECTION_${collectionName}`,
        useFactory: async (databaseService: DatabaseService) => {
            log(`provided collection_${collectionName}`)
            const collection = databaseService.db.collection<T>(collectionName);
            await ensureIndexes(collection);
            return collection;
        },
        inject: [DatabaseService]
    }
}