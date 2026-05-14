import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  SerializeOptions,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import type { GroupMember as GroupMemberType } from '$db/schemas';
import { GroupModeratorGuard } from '$src/groups/guards';
import { GroupMember } from '$common/decorators';

import {
  AddMovieDto,
  CreateCustomMovieDto,
  GroupMovieUpdateDto,
  GroupMovieResponseDto,
} from './dto';
import { GroupMoviesService } from './group-movies.service';

@ApiTags('Groups / Movies')
@ApiBearerAuth('access-token')
@Controller('groups/:groupId/movies')
export class GroupMoviesController {
  constructor(private readonly groupMoviesService: GroupMoviesService) {}

  @Post()
  @UseGuards(GroupModeratorGuard)
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({
    summary: 'Add provider movie to group (Group moderators only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 201,
    description: 'Movie added to group',
    type: GroupMovieResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  @ApiResponse({
    status: 409,
    description: 'Movie already added to this group',
  })
  addProviderMovie(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: AddMovieDto,
    @GroupMember() member: GroupMemberType,
  ) {
    return this.groupMoviesService.addProviderMovie(
      groupId,
      dto,
      member.userId,
    );
  }

  @Post('custom')
  @UseGuards(GroupModeratorGuard)
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({
    summary: 'Create custom movie in group (Group moderators only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 201,
    description: 'Custom movie created',
    type: GroupMovieResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  @ApiResponse({ status: 400, description: 'Invalid status/date combination' })
  createCustomMovie(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateCustomMovieDto,
    @GroupMember() member: GroupMemberType,
  ) {
    return this.groupMoviesService.createCustomMovie(
      groupId,
      dto,
      member.userId,
    );
  }

  @Patch(':id')
  @UseGuards(GroupModeratorGuard)
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({
    summary: 'Update movie in group (Group moderators only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'id', description: 'Group Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie updated',
    type: GroupMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found in group' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  @ApiResponse({ status: 400, description: 'Invalid status/date combination' })
  update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GroupMovieUpdateDto,
  ) {
    return this.groupMoviesService.update(groupId, id, dto);
  }

  @Delete(':id')
  @UseGuards(GroupModeratorGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove movie from group (Group moderators only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'id', description: 'Group Movie ID' })
  @ApiResponse({ status: 204, description: 'Movie removed from group' })
  @ApiResponse({ status: 404, description: 'Movie not found in group' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.groupMoviesService.remove(groupId, id);
  }
}
