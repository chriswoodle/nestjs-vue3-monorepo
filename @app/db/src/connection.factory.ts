import { Provider } from '@nestjs/common';
import * as mongodb from 'mongodb';
import { str, envsafe } from 'envsafe';

import * as path from 'path';
import debug from 'debug';
import { pkg } from './utils/environment';
const log = debug(`${pkg.name}:${path.basename(__filename)}`)

export const connectionFactory = {
    provide: 'DB_CONNECTION',
    useFactory: async () => {
        const env = envsafe({
            MONGODB_CONNECTION_STRING: str({
                desc: 'Connection string to mongodb',
            }),
        }, {
            strict: true
        })
        const client = new mongodb.MongoClient(env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
        return new Promise<{ client: mongodb.MongoClient, db: mongodb.Db }>((resolve, reject) => {
            client.connect((err) => {
                if (err) return reject(err);
                log('Connected to mongodb.');
                const db = client.db('main');
                return resolve({ client, db });
            });
        });
    }
};