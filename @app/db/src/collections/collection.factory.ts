import { pkg } from '../utils/environment';
import { Collection } from 'mongodb';

import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

import { DatabaseService } from '../database.service';

export enum CollectionName {
    Accounts = 'accounts',
    Tokens = 'tokens'
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