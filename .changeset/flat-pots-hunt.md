---
"api": minor
---

Unified provider and custom movies in a single table

- Merged custom_movies into group_movies with source field (provider/custom)
- Removed separate custom-movies module
- Updated repository, service, controller, and DTOs for unified schema
- Added check constraints for source/movieId validation
- Added IsNotEmpty validation and optimized exists query
- Added JSDoc documentation to GroupMoviesService
- Updated and expanded unit/e2e tests
