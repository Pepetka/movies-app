import type { ReviewReactionResponseDto } from '$lib/api/generated/types';

import type { ReactionEmoji } from '../constants/reactions';

export interface IProps {
	open?: boolean;
	reactions: ReviewReactionResponseDto[];
	isOwnReview: boolean;
	onSelect: (emoji: ReactionEmoji) => void;
}
