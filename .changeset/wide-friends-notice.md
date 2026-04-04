---
"api": minor
---

Consolidate movie date tracking with improved sorting and validation

- Merged plannedDate and watchedDate into a single watchDate field with a constraint that forbids dates on movies with "tracking" status
- Added composite database index to optimize group movies sorting
