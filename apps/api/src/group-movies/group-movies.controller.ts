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
import { Member, Moderator, User } from '$common/decorators';

import {
  AddMovieDto,
  EditGroupMovieDto,
  GroupMovieUpdateDto,
  MovieSearchGroupDto,
  GroupMovieResponseDto,
  SearchInGroupResponseDto,
} from './dto';
import { CustomMoviesService } from '../custom-movies/custom-movies.service';
import { CustomMovieResponseDto } from '../custom-movies/dto';
import { GroupMoviesService } from './group-movies.service';
import { MoviesService } from '../movies/movies.service';

@ApiTags('Groups / Provider Movies')
@ApiBearerAuth('access-token')
@Controller('groups/:groupId/movies')
export class GroupMoviesController {
  constructor(
    private readonly groupMoviesService: GroupMoviesService,
    private readonly moviesService: MoviesService,
    private readonly customMoviesService: CustomMoviesService,
  ) {}

  @Get('search')
  @UseGuards(GroupMemberGuard)
  @Member()
  @SerializeOptions({ type: SearchInGroupResponseDto })
  @ApiOperation({
    summary: 'Search movies in group context (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiQuery({ name: 'query', required: true, example: 'матрица' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Search results with provider and custom movies',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  async searchInGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() dto: MovieSearchGroupDto,
  ) {
    const [providerResults, currentCustom] = await Promise.all([
      this.moviesService.search({
        query: dto.query,
        page: dto.page,
      }),
      this.customMoviesService.findByGroup(groupId, dto.query),
    ]);

    return {
      provider: providerResults,
      currentGroup: currentCustom,
    };
  }

  @Get()
  @UseGuards(GroupMemberGuard)
  @Member()
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({
    summary: 'Get provider movies in group (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'List of group movies',
    type: [GroupMovieResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findAll(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupMoviesService.findByGroup(groupId);
  }

  @Post()
  @UseGuards(GroupModeratorGuard)
  @Moderator()
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
    status: 404,
    description: 'Movie not found (when adding by movieId)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  @ApiResponse({
    status: 409,
    description: 'Movie already added to this group',
  })
  add(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: AddMovieDto,
    @User('id') userId: number,
  ) {
    return this.groupMoviesService.addMovieByDto(groupId, dto, userId);
  }

  @Get(':movieId')
  @UseGuards(GroupMemberGuard)
  @Member()
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({ summary: 'Get movie details in group (Group members only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'movieId', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Group movie found',
    type: GroupMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found in group' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findOne(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    return this.groupMoviesService.findOne(groupId, movieId);
  }

  @Patch(':movieId')
  @UseGuards(GroupModeratorGuard)
  @Moderator()
  @SerializeOptions({ type: GroupMovieResponseDto })
  @ApiOperation({
    summary: 'Update movie status in group (Group moderators only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'movieId', description: 'Movie ID' })
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
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() dto: GroupMovieUpdateDto,
  ) {
    return this.groupMoviesService.update(groupId, movieId, dto);
  }

  @Patch(':movieId/edit')
  @UseGuards(GroupModeratorGuard)
  @Moderator()
  @SerializeOptions({ type: CustomMovieResponseDto })
  @ApiOperation({
    summary: 'Edit and convert movie to custom (Group moderators only)',
    description:
      'Edits movie data (title, poster, etc.) and converts to custom movie. Status and dates are preserved.',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'movieId', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie converted to custom',
    type: CustomMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found in group' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  async edit(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() dto: EditGroupMovieDto,
  ) {
    const groupMovie = await this.groupMoviesService.findOne(groupId, movieId);

    const customMovie = await this.customMoviesService.convertFromGroupMovie(
      groupMovie,
      dto,
    );

    await this.groupMoviesService.remove(groupId, movieId);

    return customMovie;
  }

  @Delete(':movieId')
  @UseGuards(GroupModeratorGuard)
  @Moderator()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove movie from group (Group moderators only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'movieId', description: 'Movie ID' })
  @ApiResponse({ status: 204, description: 'Movie removed from group' })
  @ApiResponse({ status: 404, description: 'Movie not found in group' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    return this.groupMoviesService.remove(groupId, movieId);
  }
}
