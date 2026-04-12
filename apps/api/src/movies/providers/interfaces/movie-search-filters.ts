export enum MovieSearchOrder {
  RATING = 'RATING',
  NUM_VOTE = 'NUM_VOTE',
  YEAR = 'YEAR',
}

export interface MovieSearchFilters {
  order?: MovieSearchOrder;
  ratingFrom?: number;
  ratingTo?: number;
  yearFrom?: number;
  yearTo?: number;
}
