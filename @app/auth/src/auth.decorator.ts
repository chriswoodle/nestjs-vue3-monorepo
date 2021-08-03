import { AuthGuard } from './auth.guard'
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function Auth() {
    return applyDecorators(
        UseGuards(AuthGuard),
        ApiBearerAuth(),
    );
}