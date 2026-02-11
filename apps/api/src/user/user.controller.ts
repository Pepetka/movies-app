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

import { Author, Roles, User } from '$common/decorators';
import { UserRole } from '$common/enums/user-role.enum';

import { UserCreateDto, UserUpdateDto, UserResponseDto } from './dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @SerializeOptions({ type: UserResponseDto })
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(@Body() userCreateDto: UserCreateDto) {
    return this.userService.create(userCreateDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @SerializeOptions({ type: UserResponseDto })
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.userService.findAll({ limit, offset: (page - 1) * limit });
  }

  @Get('me')
  @SerializeOptions({ type: UserResponseDto })
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user data',
    type: UserResponseDto,
  })
  getMe(@User('id') userId: number) {
    return this.userService.findOne(userId);
  }

  @Get(':id')
  @Author({ from: 'params', key: 'id' })
  @SerializeOptions({ type: UserResponseDto })
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your resource' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Author({ from: 'params', key: 'id' })
  @SerializeOptions({ type: UserResponseDto })
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your resource' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userUpdateDto: UserUpdateDto,
  ) {
    return this.userService.update(id, userUpdateDto);
  }

  @Delete(':id')
  @Author({ from: 'params', key: 'id' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your resource' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
