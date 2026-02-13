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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { UserRole } from '$common/enums/user-role.enum';
import { Roles } from '$common/decorators';
import { THROTTLE } from '$common/configs';

import {
  MovieCreateDto,
  MovieUpdateDto,
  MovieSearchDto,
  MovieResponseDto,
} from './dto';
import { ProviderSearchResult } from './providers';
import { MoviesService } from './movies.service';

@ApiTags('Movies')
@ApiBearerAuth('access-token')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('search')
  @Throttle(THROTTLE.movies.search)
  @SerializeOptions({ type: ProviderSearchResult })
  @ApiOperation({ summary: 'Search movies via provider API' })
  @ApiQuery({ name: 'query', required: true, example: 'матрица' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: ProviderSearchResult,
  })
  search(@Query() dto: MovieSearchDto) {
    return this.moviesService.search(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @Throttle(THROTTLE.movies.admin)
  @SerializeOptions({ type: MovieResponseDto })
  @ApiOperation({ summary: 'Get all movies from database (Admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of movies',
    type: [MovieResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.moviesService.findAll(limit, (page - 1) * limit);
  }

  @Get(':id')
  @SerializeOptions({ type: MovieResponseDto })
  @ApiOperation({ summary: 'Get movie by id' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie found',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @Throttle(THROTTLE.movies.admin)
  @SerializeOptions({ type: MovieResponseDto })
  @ApiOperation({
    summary: 'Create movie by IMDb ID or Provider external ID (Admin only)',
    description:
      'Create a movie using either IMDb ID (universal) or Provider external ID. Returns 409 if movie already exists.',
  })
  @ApiResponse({
    status: 201,
    description: 'Movie created',
    type: MovieResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Movie with this IMDb ID or external ID already exists',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - must provide imdbId or externalId',
  })
  create(@Body() dto: MovieCreateDto) {
    return this.moviesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @Throttle(THROTTLE.movies.admin)
  @SerializeOptions({ type: MovieResponseDto })
  @ApiOperation({ summary: 'Update movie (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie updated',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: MovieUpdateDto) {
    return this.moviesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Throttle(THROTTLE.movies.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete movie (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: 204, description: 'Movie deleted' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }
}
