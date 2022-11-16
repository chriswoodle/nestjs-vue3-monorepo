import {
    Controller, Get, Post, Put, Body, HttpStatus, HttpException,
    BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';

import { pkg } from '../utils/environment';

import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

import { Collections } from '@app/db';
import { Auth, Password, AuthService, JwtClaims, JwtClaimFromContext } from '@app/auth';
import { TokenCache } from '@app/cache';

import * as dto from './account.dto';
import { ObjectId } from 'mongodb';

@ApiTags('account')
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountCollection: Collections.AccountCollection,
        private readonly tokenCollection: Collections.TokenCollection,
        private readonly authService: AuthService,
        private readonly tokenCache: TokenCache
    ) { }

    @Get()
    @Auth()
    @ApiOperation({ summary: 'Get account info' })
    @ApiOkResponse({ description: 'Get account info.', type: Collections.AccountCollection.AccountDbo })
    async accountInfo(
        @JwtClaimFromContext() claims: JwtClaims
    ) {
        const accountId = claims.accountId;
        const data = await this.accountCollection.get(accountId);
        if (!data) {
            throw new Error('Failed to find record.');
        }
        return new Collections.AccountCollection.AccountDbo(data);
    }

    @Put()
    @ApiOperation({ summary: 'Update account info' })
    @Auth()
    async updateAccountInfo(
        @Body() body: dto.UpdateAccountInfo,
        @JwtClaimFromContext() claims: JwtClaims
    ) {
        const opResult = await this.accountCollection.updateInfo(claims.accountId, body);
        if (opResult.matchedCount === 0) {
            throw new Error(`Failed to match: this.accountCollection.updateInfo(${claims.accountId}, ${body})`)
        }
    }

    @Post()
    @ApiOperation({ summary: 'Create account' })
    @ApiOkResponse({ description: 'Create account.', type: dto.CreateAccountResponse })
    async createAccount(@Body() body: dto.CreateAccountRequest): Promise<dto.CreateAccountResponse> {
        const { password, email, birthday, nickname, gender, phoneNumber } = body;

        const existingAccount = await this.accountCollection.getByEmail(email);
        if (existingAccount) {
            throw new HttpException('Forbidden', HttpStatus.CONFLICT);
        }

        const salt = Password.generateSalt();

        const params: Parameters<Collections.AccountCollection['insertOne']> = [{
            email,
            birthday,
            gender,
            phoneNumber,
            nickname,
            passwordHash: await Password.hashPassword(password, salt),
            passwordSalt: salt,
        }];

        const account = await this.accountCollection.insertOne(...params);
        if (!account) {
            throw new Error('Failed to insert record.');
        }

        const { accessToken } = await this.createAuthToken(account);

        return { accessToken, account: new Collections.AccountCollection.AccountDbo(account) };
    }

    @Post('login')
    @ApiOperation({ summary: 'Login', description: 'Accepts username and password to return a account jwt' })
    @ApiCreatedResponse({ description: 'Authenticated.', type: dto.LoginResponse })
    @ApiBadRequestResponse({ description: 'Invalid credentials.' })
    async login(@Body() body: dto.LoginRequest): Promise<dto.LoginResponse> {
        const account = await this.accountCollection.getByEmail(body.email)
        if (!account) {
            throw new BadRequestException('Invalid credentials');
        }

        const passwordHash = await Password.hashPassword(body.password, account.passwordSalt)
        if (passwordHash !== account.passwordHash) {
            throw new BadRequestException('Invalid credentials');
        }

        const { accessToken } = await this.createAuthToken(account);
        return { accessToken }
    }

    @Post('logout')
    @Auth()
    @ApiOperation({ summary: 'Logout', description: 'Blacklist user jwt' })
    @ApiCreatedResponse({ description: 'Logged out.' })
    @ApiBadRequestResponse({ description: 'Invalid credentials.' })
    async logout(
        @JwtClaimFromContext() claims: JwtClaims,
    ) {
        log(claims.jti);
        this.tokenCache.uncacheToken(claims.jti);
        const record = (await this.tokenCollection.blacklist(claims.jti)).value;
        log(record);
        if (!record) return;
        this.tokenCache.cacheToken(record);
    }

    @Post('change-password')
    @Auth()
    @ApiOperation({ summary: 'Change password' })
    @ApiCreatedResponse({ description: 'Password changed.' })
    async changePassword(
        @Body() body: dto.ChangePassword,
        @JwtClaimFromContext() claims: JwtClaims,
    ) {
        const account = await this.accountCollection.findOne({ _id: claims.accountId });
        if (!account) {
            throw new Error('Account not valid!');
        }

        const { oldPassword } = body;
        const checkOldPassword = await Password.hashPassword(oldPassword, account.passwordSalt);
        log(oldPassword, checkOldPassword, account.passwordHash);
        if (checkOldPassword !== account.passwordHash) {
            throw new BadRequestException('Previous password does not match!');
        }

        const { newPassword } = body;
        const checkNewPassword = await Password.hashPassword(newPassword, account.passwordSalt);
        if (checkNewPassword === account.passwordHash) {
            throw new BadRequestException('New password cannot match the old password!');
        }

        const passwordSalt = await Password.generateSalt();
        const passwordHash = await Password.hashPassword(newPassword, passwordSalt)
        const result = await this.accountCollection.updatePassword(account, { passwordHash, passwordSalt });
        if (result.modifiedCount != 1) {
            throw new Error('Failed to update account!')
        }
    }

    private async createAuthToken(account: Collections.AccountCollection.Record) {
        const tokenId = new ObjectId();
        const tokenCreated = new Date();

        const claims: JwtClaims<string, number> = {
            jti: tokenId.toHexString(),
            accountId: account._id.toHexString(),
            issuer: pkg.name,
            exp: Collections.TokenCollection.getTokenTypeExpirationDate(tokenCreated, Collections.TokenCollection.TokenType.JWT).getTime() / 1000,
            iat: tokenCreated.getTime() / 1000
        };

        const accessToken = await this.authService.createToken(claims);

        const record = (await this.tokenCollection.create(account._id, Collections.TokenCollection.TokenType.JWT, accessToken, tokenId, tokenCreated));
        this.tokenCache.cacheToken(record);
        return { claims, accessToken, record };
    }
}
