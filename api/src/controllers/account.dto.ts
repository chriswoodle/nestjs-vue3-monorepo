import { Collections } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateAccountRequest {
    @ApiProperty()
    @IsNotEmpty()
    readonly birthday!: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly nickname!: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly phoneNumber!: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly gender!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    readonly email!: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    readonly password!: string;
}

export class CreateAccountResponse {
    @ApiProperty()
    readonly accessToken!: string;

    @ApiProperty()
    readonly account!: Collections.AccountCollection.AccountDbo;
}

export class LoginRequest {
    @ApiProperty()
    @IsNotEmpty()
    readonly email!: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly password!: string;
}

export class LoginResponse {
    @ApiProperty()
    accessToken!: string;
}

export class UpdateAccountInfo {
    @ApiProperty()
    @IsOptional()
    nickname?: string
}

export class ChangePassword {
    @ApiProperty()
    @IsNotEmpty()
    oldPassword!: string;

    @ApiProperty()
    @IsNotEmpty()
    newPassword!: string;
}