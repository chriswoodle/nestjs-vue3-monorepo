import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { pkg } from '../utils/environment';
import { createBasicLogger } from '@app/logging';
const log = createBasicLogger(pkg.name, __filename);

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