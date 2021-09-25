import {
    Controller, Get, Post, Put, Body, HttpStatus, HttpException,
    BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';

import * as path from 'path';
import debug from 'debug';
import { pkg } from '../utils/environment';
const log = debug(`${pkg.name}:${path.basename(__filename)}`)

import { Collections } from '@app/db';
import { Auth, Password, AuthService, JwtClaims, JwtClaimFromContext } from '@app/auth';
import { TokenCache } from '@app/cache';

import * as dto from './rescuer.dto';
import { ObjectId } from 'mongodb';
import { RescuerGpsResponse } from './rescuer.dto';

@ApiTags('rescuer')
@Controller('rescuer')
export class RescuerController {
    constructor(
        private readonly accountCollection: Collections.AccountService,
        private readonly tokenCollection: Collections.TokenService,
        private readonly authService: AuthService,
        private readonly tokenCache: TokenCache
    ) { }
    @Get("sensor-data")
    @ApiOperation({ summary: 'Check Sensor Data' }) // annotating on openapi/swagger
    @ApiOkResponse({ description: 'The Sensor Data', type: [dto.RescuerSensorDataResponse] }) // annotating on openapi/swagger
    getSensorData(): dto.RescuerSensorDataResponse[] { // name doesn't matter
        log("Sensor Data Ran")
        // Grab the data from database
        return [
            {
                timestamp: "123",
                smoke: 123,
                temperature: 123
            },
            {
                timestamp: "123",
                smoke: 123,
                temperature: 123
            },
        ]
    }

    @Get("gps")
    @ApiOperation({ summary: 'Check GPS Data' }) // annotating on openapi/swagger
    @ApiOkResponse({ description: 'The GPS Data', type: dto.RescuerGpsResponse }) // annotating on openapi/swagger
    getGps(): dto.RescuerGpsResponse { // name doesn't matter
        log("This ran")
        return {
            long: 123.555,
            lat: 125.44
        }
    }

    @Get("robot-status")
    @ApiOperation({ summary: 'Check Robot Status Data' }) // annotating on openapi/swagger
    @ApiOkResponse({ description: 'The Robot Status Data', type: dto.RescuerStatusResponse }) // annotating on openapi/swagger
    getRobotStatus(): dto.RescuerStatusResponse { // name doesn't matter
        log("This ran")
        return {
            isAuto: false
        }
    }


    @Get("location-alarms")
    @ApiOperation({ summary: 'Check Location Alarms Data' }) // annotating on openapi/swagger
    @ApiOkResponse({ description: 'The Location Alarms Data', type: [dto.RescuerLocationAlarmResponse] }) // annotating on openapi/swagger
    getLocationAlarmStatus(): dto.RescuerLocationAlarmResponse[] { // name doesn't matter
        log("This ran")
        return [
            {
                type: "sound",
                x: 15,
                y: 10
            },
            {
                type: "sound",
                x: 15,
                y: 10
            }
        ]
    }

    @Post('robot-status')
    @ApiOperation({ summary: 'Robot Status', description: 'Accepts isAuto and other system parameters to set on robot' })
    // @ApiCreatedResponse({ description: 'Authenticated.', type: [dto.LoginResponse] }) // use an array, or make a class of items
    @ApiCreatedResponse({ description: 'Authenticated.', type: dto.RescuerStatusResponse })
    @ApiBadRequestResponse({ description: 'Invalid credentials.' })
    async sendRobotStatus(@Body() body: dto.RescuerStatusRequest): Promise<dto.RescuerStatusResponse> { // Promise is the good response expect. To throw a bad response from an API, use Throw keyword 
        // and base it on the same error frmo the robot
        log("this ran");
        log(body, "body");
        if ('isAuto' in body) {
            // Post a request in Axios await
            log("isAuto executed")
        }

        return {
            isAuto: true
        }
    }

    @Post('direction-input')
    @ApiOperation({ summary: 'Direction Input', description: 'Accepts D Pad Key values' })
    @ApiCreatedResponse({ description: 'Authenticated.', type: dto.RescuerStatusResponse })
    @ApiBadRequestResponse({ description: 'Invalid credentials.' })
    async sendDirectionInput(@Body() body: dto.RescuerStatusRequest): Promise<dto.RescuerStatusResponse> { // Promise is the good response expect. To throw a bad response from an API, use Throw keyword 

        // Post this straight to database
        // Post and reform into the API for the device

        log("this ran");
        log(body, "body");
        if ('isAuto' in body) {
            // Post a request in Axios await
            log("isAuto executed")
        }

        return {
            isAuto: true
        }
    }


}
