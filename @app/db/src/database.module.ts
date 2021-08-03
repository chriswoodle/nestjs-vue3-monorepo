import { Module, Inject } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { connectionFactory } from './connection.factory';
import { collectionProviders, collectionServices } from './collections';
@Module({
    imports: [],
    providers: [
        DatabaseService,
        connectionFactory,
        ...collectionServices,
        ...collectionProviders
    ],
    exports: [
        DatabaseService,
        ...collectionServices
    ]
})
export class DatabaseModule {}
