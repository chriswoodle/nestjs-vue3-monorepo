import { ObjectId } from 'mongodb';
export interface BaseRecord<T = ObjectId> {
    _id: T;
    createdOn: Date;
    updatedOn?: Date;
}

export interface Stringifiable {
    toString: () => string;
}

export type Creatable<T> = Omit<T, 'createdOn' | '_id' | 'expireAt'> & { _id?: ObjectId, createdOn?: Date };

export function ensureCreatedOn<T>(record: Creatable<T>) {
    return {
        ...record,
        createdOn: new Date()
    };
}