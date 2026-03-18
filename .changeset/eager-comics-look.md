---
"web": minor
---

Group movies management with provider search

- Created movies module (api, stores, components, types, validation)
- Group page with movies grid and status filtering (all/tracking/planned/watched)
- Movies search page with Kinopoisk provider integration
- MovieCard, MovieGrid, MovieStatusBadge components
- groupMoviesStore — fetches provider + custom movies with unified type
- groupMovieStore — mutations for add/create/update/remove operations
- Query system integration with automatic invalidation
