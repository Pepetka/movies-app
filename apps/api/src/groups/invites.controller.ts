import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public, User } from '$common/decorators';
import { THROTTLE } from '$common/configs';

import {
  InviteInfoResponseDto,
  AcceptInviteResponseDto,
  InviteTokenParamDto,
} from './dto';
import { GroupsService } from './groups.service';

@ApiTags('Invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly groupsService: GroupsService) {}

  @Public()
  @Get(':token')
  @Throttle(THROTTLE.invites.info)
  @SerializeOptions({ type: InviteInfoResponseDto })
  @ApiOperation({ summary: 'Get invite info by token (Public)' })
  @ApiParam({
    name: 'token',
    description: 'Invite token',
    schema: {
      type: 'string',
      minLength: 32,
      maxLength: 32,
      pattern: '^[0-9a-f]+$',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Invite info',
    type: InviteInfoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  getInviteInfo(@Param() { token }: InviteTokenParamDto) {
    return this.groupsService.getInviteInfo(token);
  }

  @Post(':token/accept')
  @Throttle(THROTTLE.invites.accept)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: AcceptInviteResponseDto })
  @ApiOperation({ summary: 'Accept group invite' })
  @ApiParam({
    name: 'token',
    description: 'Invite token',
    schema: {
      type: 'string',
      minLength: 32,
      maxLength: 32,
      pattern: '^[0-9a-f]+$',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Invite accepted',
    type: AcceptInviteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  @ApiResponse({ status: 409, description: 'User already a member' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  acceptInvite(
    @Param() { token }: InviteTokenParamDto,
    @User('id') userId: number,
  ) {
    return this.groupsService.acceptInvite(token, userId);
  }
}
