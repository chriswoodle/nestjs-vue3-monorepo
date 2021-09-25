import { Collections } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

// this is one object
// GET - REQUEST

export class RescuerSensorDataResponse {
    @ApiProperty()
    readonly timestamp!: string;

    @ApiProperty()
    readonly smoke!: number;

    @ApiProperty()
    readonly temperature!: number;
}
export class RescuerGpsResponse {
    @ApiProperty()
    readonly long!: number;

    @ApiProperty()
    readonly lat!: number;
}

export class RescuerStatusResponse {
    @ApiProperty()
    readonly isAuto!: boolean;
}

export class RescuerLocationAlarmResponse {
    @ApiProperty()
    readonly type!: string;

    @ApiProperty()
    readonly x!: number;

    @ApiProperty()
    readonly y!: number
}

// POST request
export class RescuerStatusRequest {
    @ApiProperty()
    @IsNotEmpty()
    readonly isAuto!: boolean;
}

export class RescuerDirectionInputRequest {
    @ApiProperty()
    @IsNotEmpty()
    readonly input!: string;
}