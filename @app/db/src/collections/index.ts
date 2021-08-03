import * as accountService from './account.service';
export { AccountService } from './account.service';
import * as tokenService from './token.service';
export { TokenService } from './token.service';

export const collectionProviders = [
    accountService,
    tokenService,
].map(service => service.collectionProvider)

export const collectionServices = [
    accountService.AccountService,
    tokenService.TokenService,
];