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

import { Public, User } from '$common/decorators';

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
  @SerializeOptions({ type: InviteInfoResponseDto })
  @ApiOperation({ summary: 'Get invite info by token (Public)' })
  @ApiParam({ name: 'token', description: 'Invite token' })
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
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ type: AcceptInviteResponseDto })
  @ApiOperation({ summary: 'Accept group invite' })
  @ApiParam({ name: 'token', description: 'Invite token' })
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
