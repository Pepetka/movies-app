import type { GroupMovieResponseDto, ReviewResponseDto } from '$lib/api/generated/types';

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
	status: MovieStatus;
	watchDate?: string;
	createdAt: string;
	updatedAt: string;
	reviews?: ReviewResponseDto[];
	averageRating?: number | null;
	reviewCount?: number;
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
	status: movie.status,
	watchDate: movie.watchDate ?? undefined,
	createdAt: movie.createdAt,
	updatedAt: movie.updatedAt,
	reviews: movie.reviews ?? undefined,
	averageRating: movie.averageRating ?? undefined,
	reviewCount: movie.reviewCount ?? undefined
});

export const getStatusLabel = (status: MovieStatus): string => {
	const labels: Record<MovieStatus, string> = {
		tracking: 'К просмотру',
		planned: 'План',
		watched: 'Смотрели'
	};
	return labels[status];
};
