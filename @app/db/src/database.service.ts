import { Injectable, Inject } from '@nestjs/common';
import { connectionFactory } from './connection.factory';

import * as mongodb from 'mongodb';

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

@Injectable()
export class DatabaseService {
    public readonly db: mongodb.Db;
    constructor(
        @Inject(connectionFactory.provide) private readonly connection: Awaited<ReturnType<typeof connectionFactory.useFactory>>
    ) {
        this.db = connection.db;
    }
}
