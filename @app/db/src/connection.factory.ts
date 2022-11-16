import * as mongodb from 'mongodb';
import { str, envsafe } from 'envsafe';

import { pkg } from './utils/environment';

import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

export const connectionFactory = {
    provide: 'DB_CONNECTION',
    useFactory: async () => {
        const env = envsafe({
            MONGODB_CONNECTION_STRING: str({
                desc: 'Connection string to mongodb',
            }),
            MONGODB_DATABASE_NAME: str({
                desc: 'Database Name',
                default: 'main'
            }),
        }, {
            strict: true
        })
        const client = new mongodb.MongoClient(env.MONGODB_CONNECTION_STRING);
        await client.connect();
        log('Connected to mongodb.');
        const db = client.db(env.MONGODB_DATABASE_NAME);
        return { client, db };
    }
};