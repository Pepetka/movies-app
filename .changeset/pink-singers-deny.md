---
"web": minor
---

Refactored query system with Query/Mutation classes and split stores architecture

- Converted createQuery factory to Query class with status, isCurrentKey, revalidate methods
- Added createMutation factory with automatic cache invalidation via tags and invalidateKeys
- Split groups store into groups-store (list) and group-store (item + mutations)
- Added onReset subscription in QueryRegistry for mutation reset on logout
- Added FetchStatus (idle/loading/fetching/loaded/error) and PostStatus (idle/submitting/success/error) types
- Added comprehensive query store pattern documentation in docs/query-store-pattern.md
- Removed dead PostStatus duplicate from groups/types.ts
