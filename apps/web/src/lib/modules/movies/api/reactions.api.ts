import {
	groupMovieReviewsControllerCreateReactionV1,
	groupMovieReviewsControllerDeleteReactionV1
} from '$lib/api/generated/api';
import type { CreateReviewReactionDto, ReviewReactionResponseDto } from '$lib/api/generated/types';

export const createReaction = async (
	groupId: number,
	movieId: number,
	reviewId: number,
	data: CreateReviewReactionDto,
	signal?: AbortSignal
): Promise<ReviewReactionResponseDto> => {
	return groupMovieReviewsControllerCreateReactionV1(groupId, movieId, reviewId, data, { signal });
};

export const deleteReaction = async (
	groupId: number,
	movieId: number,
	reviewId: number,
	signal?: AbortSignal
): Promise<void> => {
	return groupMovieReviewsControllerDeleteReactionV1(groupId, movieId, reviewId, { signal });
};
