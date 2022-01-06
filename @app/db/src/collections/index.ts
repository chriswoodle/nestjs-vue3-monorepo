import * as accountCollection from './account.collection';
export { AccountCollection } from './account.collection';
import * as tokenCollection from './token.collection';
export { TokenCollection } from './token.collection';

export const collectionProviders = [
    accountCollection,
    tokenCollection,
].map(service => service.collectionProvider)

export const collectionServices = [
    accountCollection.AccountCollection,
    tokenCollection.TokenCollection,
];