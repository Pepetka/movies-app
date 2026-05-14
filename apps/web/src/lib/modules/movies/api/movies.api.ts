import {
	groupMovieDetailsControllerFindAllV1,
	groupMovieDetailsControllerFindOneV1,
	groupMoviesControllerAddProviderMovieV1,
	groupMoviesControllerCreateCustomMovieV1,
	groupMoviesControllerUpdateV1,
	groupMoviesControllerRemoveV1,
	moviesControllerSearchV1
} from '$lib/api/generated/api';
import type {
	AddMovieDto,
	CreateCustomMovieDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto
} from '$lib/api/generated/types';

export const getGroupMovies = async (
	groupId: number,
	signal?: AbortSignal
): Promise<GroupMovieResponseDto[]> => {
	return groupMovieDetailsControllerFindAllV1(groupId, undefined, { signal });
};

export const getGroupMovie = async (
	groupId: number,
	movieId: number,
	signal?: AbortSignal
): Promise<GroupMovieResponseDto> => {
	return groupMovieDetailsControllerFindOneV1(groupId, movieId, { signal });
};

export const searchMovies = async (
	query: string,
	signal?: AbortSignal
): Promise<ReturnType<typeof moviesControllerSearchV1>> => {
	return moviesControllerSearchV1({ query }, { signal });
};

export const addProviderMovie = async (
	groupId: number,
	data: AddMovieDto,
	signal?: AbortSignal
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerAddProviderMovieV1(groupId, data, { signal });
};

export const createCustomMovie = async (
	groupId: number,
	data: CreateCustomMovieDto,
	signal?: AbortSignal
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerCreateCustomMovieV1(groupId, data, { signal });
};

export const updateMovie = async (
	groupId: number,
	movieId: number,
	data: GroupMovieUpdateDto,
	signal?: AbortSignal
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerUpdateV1(groupId, movieId, data, { signal });
};

export const removeMovie = async (
	groupId: number,
	movieId: number,
	signal?: AbortSignal
): Promise<void> => {
	return groupMoviesControllerRemoveV1(groupId, movieId, { signal });
};
