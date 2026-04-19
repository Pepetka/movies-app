import type { GroupMovieResponseDto } from '$lib/api/generated/types';

export type MovieStatus = 'tracking' | 'planned' | 'watched';

export type MovieFilter = 'all' | MovieStatus;

export interface UnifiedMovie {
	id: number;
	isCustom: boolean;
	groupId: number;
	title: string;
	posterPath?: string;
	overview?: string;
	releaseYear?: number;
	runtime?: number;
	rating?: number;
	status: MovieStatus;
	watchDate?: string;
	createdAt: string;
	updatedAt: string;
}

export const mapToUnified = (movie: GroupMovieResponseDto): UnifiedMovie => ({
	id: movie.id,
	isCustom: movie.source === 'custom',
	groupId: movie.groupId,
	title: movie.title,
	posterPath: movie.posterPath ?? undefined,
	overview: movie.overview ?? undefined,
	releaseYear: movie.releaseYear ?? undefined,
	runtime: movie.runtime ?? undefined,
	rating:
		movie.rating != null && Number.isFinite(Number(movie.rating))
			? Number(movie.rating)
			: undefined,
	status: movie.status,
	watchDate: movie.watchDate ?? undefined,
	createdAt: movie.createdAt,
	updatedAt: movie.updatedAt
});

export const getStatusLabel = (status: MovieStatus): string => {
	const labels: Record<MovieStatus, string> = {
		tracking: 'К просмотру',
		planned: 'План',
		watched: 'Смотрели'
	};
	return labels[status];
};
