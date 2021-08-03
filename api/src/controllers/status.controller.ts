import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';

import * as path from 'path';
import debug from 'debug';
import { pkg } from '../utils/environment';
const log = debug(`${pkg.name}:${path.basename(__filename)}`)

@ApiTags('status')
@Controller('status')
export class StatusController {
    constructor(
    ) { }

    @Get()
    @ApiOperation({ summary: 'Check server status' })
    @ApiOkResponse({ description: 'Server is up.' })
    status() {
        log('status');
    }
}