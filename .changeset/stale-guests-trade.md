---
"api": patch
---

Group movies list now returns full movie details

- Added findByGroupWithDetails repository method with JOIN to movies table
- GroupMovieResponseDto now includes title, posterPath, overview, releaseYear, runtime, rating
- Reduced frontend requests — no need to fetch movie details separately
- Refactored nullable types across DTOs (MovieResponseDto, GroupResponseDto, CustomMovieResponseDto, ProviderMovieSummary, ProviderMovieDetails)
