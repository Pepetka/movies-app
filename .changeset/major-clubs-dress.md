---
"api": minor
---

Added movie search filters for group movies

- Added `SearchGroupMoviesDto` with advanced filtering, cross-field validation (`AtLeastOneOf`, `GroupMovieStatus` enum), custom validators, and endpoint integration
- Made provider movie rating nullable to handle missing ratings
