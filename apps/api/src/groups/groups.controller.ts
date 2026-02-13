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
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import {
  GroupAdminGuard,
  GroupMemberGuard,
  GroupModeratorGuard,
  RolesGuard,
} from '$common/guards';
import { UserRole } from '$common/enums/user-role.enum';
import { User, Roles } from '$common/decorators';

import {
  GroupCreateDto,
  GroupUpdateDto,
  GroupResponseDto,
  GroupMemberAddDto,
  GroupMemberRoleUpdateDto,
  GroupMemberResponseDto,
  TransferOwnershipDto,
} from './dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@ApiBearerAuth('access-token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @SerializeOptions({ type: GroupResponseDto })
  @ApiOperation({ summary: "Get current user's groups" })
  @ApiResponse({
    status: 200,
    description: 'List of groups',
    type: [GroupResponseDto],
  })
  findAll(@User('id') userId: number) {
    return this.groupsService.findUserGroups(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @SerializeOptions({ type: GroupResponseDto })
  @ApiOperation({ summary: 'Get all groups (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all groups',
    type: [GroupResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAllGroups() {
    return this.groupsService.findAllGroups();
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @SerializeOptions({ type: GroupResponseDto })
  @ApiOperation({ summary: "Get user's groups by user ID (Admin only)" })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: "List of user's groups",
    type: [GroupResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findUserGroupsByAdmin(@Param('userId', ParseIntPipe) userId: number) {
    return this.groupsService.findUserGroupsByAdmin(userId);
  }

  @Get(':id')
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: GroupResponseDto })
  @ApiOperation({ summary: 'Get group by id (Group members only)' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Group found',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  findOne(@Param('id', ParseIntPipe) id: number, @User('id') userId: number) {
    return this.groupsService.findOne(id, userId);
  }

  @Post()
  @SerializeOptions({ type: GroupResponseDto })
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({
    status: 201,
    description: 'Group created',
    type: GroupResponseDto,
  })
  create(@User('id') userId: number, @Body() dto: GroupCreateDto) {
    return this.groupsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(GroupModeratorGuard)
  @SerializeOptions({ type: GroupResponseDto })
  @ApiOperation({ summary: 'Update group (Group moderators only)' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Group updated',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
    @Body() dto: GroupUpdateDto,
  ) {
    return this.groupsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(GroupAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete group (Group admin only)' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 204, description: 'Group deleted' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the group admin' })
  remove(@Param('id', ParseIntPipe) id: number, @User('id') userId: number) {
    return this.groupsService.remove(id, userId);
  }

  @Get(':id/members')
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: GroupMemberResponseDto })
  @ApiOperation({ summary: 'Get group members (Group members only)' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'List of group members',
    type: [GroupMemberResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  getMembers(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return this.groupsService.getMembers(id, userId);
  }

  @Get(':id/members/me')
  @UseGuards(GroupMemberGuard)
  @SerializeOptions({ type: GroupMemberResponseDto })
  @ApiOperation({
    summary: 'Get current user info in group (Group members only)',
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Current user member info',
    type: GroupMemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not a group member' })
  getMemberMe(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return this.groupsService.getMemberMe(id, userId);
  }

  @Post(':id/members')
  @UseGuards(GroupModeratorGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add member to group (Group moderators only)' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 409, description: 'User already a member' })
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
    @Body() dto: GroupMemberAddDto,
  ) {
    return this.groupsService.addMember(id, dto, userId);
  }

  @Patch(':id/members/:userId')
  @UseGuards(GroupAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Update member's role (Group admin only)",
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'Member role updated' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) memberUserId: number,
    @User('id') userId: number,
    @Body() dto: GroupMemberRoleUpdateDto,
  ) {
    return this.groupsService.updateMemberRole(id, memberUserId, dto, userId);
  }

  @Delete(':id/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 204, description: 'Left group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Last admin cannot leave',
  })
  leaveGroup(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return this.groupsService.leaveGroup(id, userId);
  }

  @Delete(':id/members/:userId')
  @UseGuards(GroupModeratorGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove member from group (Group moderators only)',
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions or cannot remove admin',
  })
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) memberUserId: number,
    @User('id') userId: number,
  ) {
    return this.groupsService.removeMember(id, memberUserId, userId);
  }

  @Post(':id/transfer-ownership')
  @UseGuards(GroupAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Transfer group admin rights (Group admin only)',
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 204, description: 'Admin rights transferred' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not admin or invalid target',
  })
  transferOwnership(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.groupsService.transferOwnership(id, dto.targetUserId, userId);
  }
}
