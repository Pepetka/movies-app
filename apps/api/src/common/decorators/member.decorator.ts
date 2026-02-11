import { SetMetadata } from '@nestjs/common';

export const GROUP_MEMBER_KEY = Symbol('isGroupMember');

export const Member = () => SetMetadata(GROUP_MEMBER_KEY, true);
