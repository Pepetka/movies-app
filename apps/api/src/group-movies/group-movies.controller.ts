import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  SerializeOptions,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { GroupMemberGuard, GroupModeratorGuard } from '$common/guards';
import { User } from '$common/decorators';

import {
  AddMovieDto,
  CreateCustomMovieDto,
  GroupMovieUpdateDto,
  MovieSearchGroupDto,
  GroupMovieResponseDto,
  SearchInGroupResponseDto,
} from './dto';
import { GroupMoviesService } from './group-movies.service';
import { MoviesService } from '../movies/movies.service';

@ApiTags('Groups / Movies')
@ApiBearerAuth('access-token')
@Controller('groups/:groupId/movies')
export class GroupMoviesController {
  constructor(
    private readonly groupMoviesService: GroupMoviesService,
    private readonly moviesService: MoviesService,
  ) {}

  @Get('search')
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: SearchInGroupResponseDto })
  @ApiOperation({
    summary: 'Search movies in group context (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiQuery({ name: 'query', required: true, example: 'матрица' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Search results with provider and group movies',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  async searchInGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() dto: MovieSearchGroupDto,
  ) {
    const [providerResults, groupMovies] = await Promise.all([
      this.moviesService.search({
        query: dto.query,
        page: dto.page,
      }),
      this.groupMoviesService.findByGroup(groupId, undefined, dto.query),
    ]);

    return {
      provider: providerResults,
      currentGroup: groupMovies,
    };
  }

  @Get()
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({
    summary: 'Get all movies in group (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['tracking', 'planned', 'watched'],
  })
  @ApiQuery({ name: 'query', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of group movies',
    type: [GroupMovieResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findAll(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('status') status?: string,
    @Query('query') query?: string,
  ) {
    return this.groupMoviesService.findByGroup(groupId, status, query);
  }

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
    @User('id') userId: number,
  ) {
    return this.groupMoviesService.addProviderMovie(groupId, dto, userId);
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
  createCustomMovie(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateCustomMovieDto,
    @User('id') userId: number,
  ) {
    return this.groupMoviesService.createCustomMovie(groupId, dto, userId);
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
    @User('id') userId: number,
  ) {
    return this.groupMoviesService.findOne(groupId, id, userId);
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
