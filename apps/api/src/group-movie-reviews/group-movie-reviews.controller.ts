import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  SerializeOptions,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { GroupMemberGuard } from '$src/groups/guards';
import type { GroupMovieReview } from '$db/schemas';
import { User, Review } from '$common/decorators';

import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewResponseDto,
  ReviewListResponseDto,
} from './dto';
import { GroupMovieReviewsService } from './group-movie-reviews.service';
import { ReviewAuthorGuard } from './guards';

@ApiTags('Groups / Movie Reviews')
@ApiBearerAuth('access-token')
@Controller('groups/:groupId/movies/:groupMovieId/reviews')
export class GroupMovieReviewsController {
  constructor(
    private readonly groupMovieReviewsService: GroupMovieReviewsService,
  ) {}

  @Get()
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: ReviewListResponseDto })
  @ApiOperation({
    summary: 'Get all reviews for a group movie (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'groupMovieId', description: 'Group Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'List of reviews with average rating',
    type: ReviewListResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  async findAll(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('groupMovieId', ParseIntPipe) groupMovieId: number,
    @User('id') userId: number,
  ): Promise<ReviewListResponseDto> {
    return this.groupMovieReviewsService.findAll(groupId, groupMovieId, userId);
  }

  @Get('my')
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: ReviewResponseDto })
  @ApiOperation({
    summary: 'Get current user review for a group movie (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'groupMovieId', description: 'Group Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Current user review',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  async findMyReview(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('groupMovieId', ParseIntPipe) groupMovieId: number,
    @User('id') userId: number,
  ): Promise<ReviewResponseDto> {
    return this.groupMovieReviewsService.findMyReviewOrThrow(
      groupId,
      groupMovieId,
      userId,
    );
  }

  @Post()
  @UseGuards(GroupMemberGuard)
  @HttpCode(HttpStatus.CREATED)
  @SerializeOptions({ type: ReviewResponseDto })
  @ApiOperation({
    summary: 'Create a review for a group movie (Group members only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'groupMovieId', description: 'Group Movie ID' })
  @ApiResponse({
    status: 201,
    description: 'Review created',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid rating or text' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  @ApiResponse({
    status: 409,
    description: 'Review already exists',
  })
  @ApiResponse({
    status: 422,
    description: 'Movie not watched',
  })
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('groupMovieId', ParseIntPipe) groupMovieId: number,
    @Body() dto: CreateReviewDto,
    @User('id') userId: number,
  ): Promise<ReviewResponseDto> {
    return this.groupMovieReviewsService.create(
      groupId,
      groupMovieId,
      userId,
      dto,
    );
  }

  @Patch(':id')
  @UseGuards(GroupMemberGuard, ReviewAuthorGuard)
  @SerializeOptions({ type: ReviewResponseDto })
  @ApiOperation({
    summary: 'Update a review (Author or global admin only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'groupMovieId', description: 'Group Movie ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review updated',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({
    status: 422,
    description: 'Movie not watched',
  })
  async update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('groupMovieId', ParseIntPipe) groupMovieId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @User('id') userId: number,
    @Review() review: GroupMovieReview,
  ): Promise<ReviewResponseDto> {
    return this.groupMovieReviewsService.update(
      id,
      groupId,
      groupMovieId,
      userId,
      dto,
      review,
    );
  }

  @Delete(':id')
  @UseGuards(GroupMemberGuard, ReviewAuthorGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a review (Author or global admin only)',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'groupMovieId', description: 'Group Movie ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 204, description: 'Review deleted' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async delete(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('groupMovieId', ParseIntPipe) groupMovieId: number,
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
    @Review() review: GroupMovieReview,
  ): Promise<void> {
    return this.groupMovieReviewsService.delete(
      id,
      groupId,
      groupMovieId,
      userId,
      review,
    );
  }
}
