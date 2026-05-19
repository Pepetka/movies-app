import type { ReviewResponseDto } from '$lib/api/generated/types';

export interface IProps {
	review: ReviewResponseDto;
	isOwn: boolean;
	groupId: number;
	onEdit?: () => void;
	onDelete?: () => void;
}
