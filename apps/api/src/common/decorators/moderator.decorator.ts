import { SetMetadata } from '@nestjs/common';

export const GROUP_MODERATOR_KEY = Symbol('isGroupModerator');

export const Moderator = () => SetMetadata(GROUP_MODERATOR_KEY, true);
