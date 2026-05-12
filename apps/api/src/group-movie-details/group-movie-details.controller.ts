import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SerializeOptions } from '@nestjs/common';

import {
  GroupMovieResponseDto,
  FindAllGroupMoviesDto,
  MovieSearchGroupDto,
  SearchInGroupResponseDto,
} from '$src/group-movies/dto';
import type {
  GroupMember as GroupMemberType,
  User as UserType,
} from '$db/schemas';
import { GroupMemberGuard, GroupModeratorGuard } from '$src/groups/guards';
import { GroupMember, User } from '$common/decorators';
import { GroupMemberRole } from '$common/enums';

import { GroupMovieDetailsService } from './group-movie-details.service';

@ApiTags('Groups / Movies')
@ApiBearerAuth('access-token')
@Controller('groups/:groupId/movies')
export class GroupMovieDetailsController {
  constructor(
    private readonly groupMovieDetailsService: GroupMovieDetailsService,
  ) {}

  @Get('search')
  @UseGuards(GroupModeratorGuard)
  @SerializeOptions({ type: SearchInGroupResponseDto })
  @ApiOperation({
    summary: 'Search movies in group context (Group moderators only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Search results with provider and group movies',
    type: SearchInGroupResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  searchInGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() dto: MovieSearchGroupDto,
  ) {
    return this.groupMovieDetailsService.searchInGroup(groupId, dto);
  }

  @Get()
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({
    summary: 'Get all movies in group (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'List of group movies',
    type: [GroupMovieResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findAll(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() dto: FindAllGroupMoviesDto,
  ) {
    return this.groupMovieDetailsService.findAll(groupId, dto);
  }

  @Get(':id')
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({ summary: 'Get movie details in group (Group members only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'id', description: 'Group Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Group movie found',
    type: GroupMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found in group' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findOne(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('id', ParseIntPipe) id: number,
    @GroupMember() member: GroupMemberType,
    @User() user: UserType,
  ) {
    return this.groupMovieDetailsService.findOne(
      groupId,
      id,
      member.role as GroupMemberRole,
      user.id,
    );
  }
}
