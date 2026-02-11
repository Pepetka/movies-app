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
  DefaultValuePipe,
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
  CreateCustomMovieDto,
  UpdateCustomMovieDto,
  CustomMovieResponseDto,
} from './dto';
import { CustomMoviesService } from './custom-movies.service';

@ApiTags('Groups / Custom Movies')
@ApiBearerAuth('access-token')
@Controller('groups/:groupId/custom-movies')
export class CustomMoviesController {
  constructor(private readonly customMoviesService: CustomMoviesService) {}

  @Get()
  @UseGuards(GroupMemberGuard)
  @Member()
  @SerializeOptions({ type: CustomMovieResponseDto })
  @ApiOperation({ summary: 'Get custom movies in group (Group members only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of custom movies',
    type: [CustomMovieResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findAll(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('query') query?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.customMoviesService.findByGroup(
      groupId,
      query,
      limit,
      (page - 1) * limit,
    );
  }

  @Post()
  @UseGuards(GroupModeratorGuard)
  @Moderator()
  @SerializeOptions({ type: CustomMovieResponseDto })
  @ApiOperation({
    summary: 'Create custom movie in group (Group moderators only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 201,
    description: 'Custom movie created',
    type: CustomMovieResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateCustomMovieDto,
    @User('id') userId: number,
  ) {
    return this.customMoviesService.create(groupId, userId, dto);
  }

  @Get(':customMovieId')
  @UseGuards(GroupMemberGuard)
  @Member()
  @SerializeOptions({ type: CustomMovieResponseDto })
  @ApiOperation({ summary: 'Get custom movie by id (Group members only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'customMovieId', description: 'Custom Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Custom movie found',
    type: CustomMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Custom movie not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findOne(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('customMovieId', ParseIntPipe) customMovieId: number,
  ) {
    return this.customMoviesService.findOne(customMovieId, groupId);
  }

  @Patch(':customMovieId')
  @UseGuards(GroupModeratorGuard)
  @Moderator()
  @SerializeOptions({ type: CustomMovieResponseDto })
  @ApiOperation({ summary: 'Update custom movie (Group moderators only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'customMovieId', description: 'Custom Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Custom movie updated',
    type: CustomMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Custom movie not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('customMovieId', ParseIntPipe) customMovieId: number,
    @Body() dto: UpdateCustomMovieDto,
  ) {
    return this.customMoviesService.update(customMovieId, groupId, dto);
  }

  @Delete(':customMovieId')
  @UseGuards(GroupModeratorGuard)
  @Moderator()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom movie (Group moderators only)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'customMovieId', description: 'Custom Movie ID' })
  @ApiResponse({ status: 204, description: 'Custom movie deleted' })
  @ApiResponse({ status: 404, description: 'Custom movie not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a group moderator',
  })
  remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('customMovieId', ParseIntPipe) customMovieId: number,
  ) {
    return this.customMoviesService.remove(customMovieId, groupId);
  }
}
