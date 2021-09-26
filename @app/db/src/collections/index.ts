import * as accountService from './account.service';
export { AccountService } from './account.service';
import * as tokenService from './token.service';
export { TokenService } from './token.service';
import * as rescuerService from "./rescuer.service"
export { RescuerService } from './rescuer.service';

export const collectionProviders = [
    accountService,
    tokenService,
    rescuerService
].map(service => service.collectionProvider)

export const collectionServices = [
    accountService.AccountService,
    tokenService.TokenService,
    rescuerService.RescuerService
];