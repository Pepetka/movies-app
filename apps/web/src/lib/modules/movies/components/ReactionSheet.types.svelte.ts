import type { ReviewReactionResponseDto } from '$lib/api/generated/types';

export interface Props {
	open?: boolean;
	reactions: ReviewReactionResponseDto[];
	isOwnReview: boolean;
	onSelect: (emoji: string) => void;
}
