import {
	groupMoviesControllerFindAllV1,
	groupMoviesControllerFindOneV1,
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
	return groupMoviesControllerFindAllV1(groupId, undefined, { signal });
};

export const getGroupMovie = async (
	groupId: number,
	movieId: number,
	signal?: AbortSignal
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerFindOneV1(groupId, movieId, { signal });
};

export const searchMovies = async (query: string, signal?: AbortSignal) => {
	return moviesControllerSearchV1({ query }, { signal });
};

export const addProviderMovie = async (
	groupId: number,
	data: AddMovieDto
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerAddProviderMovieV1(groupId, data);
};

export const createCustomMovie = async (
	groupId: number,
	data: CreateCustomMovieDto
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerCreateCustomMovieV1(groupId, data);
};

export const updateMovie = async (
	groupId: number,
	movieId: number,
	data: GroupMovieUpdateDto
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerUpdateV1(groupId, movieId, data);
};

export const removeMovie = async (groupId: number, movieId: number): Promise<void> => {
	return groupMoviesControllerRemoveV1(groupId, movieId);
};
