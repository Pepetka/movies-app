import {
	groupMoviesControllerFindAllV1,
	groupMoviesControllerAddV1,
	groupMoviesControllerUpdateV1,
	groupMoviesControllerRemoveV1,
	groupMoviesControllerEditV1,
	customMoviesControllerFindAllV1,
	customMoviesControllerCreateV1,
	customMoviesControllerUpdateV1,
	customMoviesControllerRemoveV1,
	moviesControllerSearchV1
} from '$lib/api/generated/api';
import type {
	AddMovieDto,
	CreateCustomMovieDto,
	CustomMovieResponseDto,
	EditGroupMovieDto,
	GroupMovieResponseDto,
	GroupMovieUpdateDto,
	UpdateCustomMovieDto
} from '$lib/api/generated/types';

export const getGroupMovies = async (
	groupId: number,
	signal?: AbortSignal
): Promise<GroupMovieResponseDto[]> => {
	return groupMoviesControllerFindAllV1(groupId, { signal });
};

export const getCustomMovies = async (
	groupId: number,
	signal?: AbortSignal
): Promise<CustomMovieResponseDto[]> => {
	return customMoviesControllerFindAllV1(groupId, undefined, { signal });
};

export const searchMovies = async (query: string, signal?: AbortSignal) => {
	return moviesControllerSearchV1({ query }, { signal });
};

export const addGroupMovie = async (
	groupId: number,
	data: AddMovieDto
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerAddV1(groupId, data);
};

export const createCustomMovie = async (
	groupId: number,
	data: CreateCustomMovieDto
): Promise<CustomMovieResponseDto> => {
	return customMoviesControllerCreateV1(groupId, data);
};

export const updateMovieStatus = async (
	groupId: number,
	movieId: number,
	data: GroupMovieUpdateDto
): Promise<GroupMovieResponseDto> => {
	return groupMoviesControllerUpdateV1(groupId, movieId, data);
};

export const updateCustomMovie = async (
	groupId: number,
	movieId: number,
	data: UpdateCustomMovieDto
): Promise<CustomMovieResponseDto> => {
	return customMoviesControllerUpdateV1(groupId, movieId, data);
};

export const editAndConvertMovie = async (
	groupId: number,
	movieId: number,
	data: EditGroupMovieDto
): Promise<CustomMovieResponseDto> => {
	return groupMoviesControllerEditV1(groupId, movieId, data);
};

export const removeGroupMovie = async (groupId: number, movieId: number): Promise<void> => {
	return groupMoviesControllerRemoveV1(groupId, movieId);
};

export const removeCustomMovie = async (groupId: number, movieId: number): Promise<void> => {
	return customMoviesControllerRemoveV1(groupId, movieId);
};
