---
"web": minor
---

Movie detail pages with create/edit functionality and role-based access control

- Movie detail page at /groups/[id]/movies/[movieId] with full information display
- Movie create/edit pages for custom movies with form validation
- MovieStatusModal for changing movie status with date pickers
- Date display on movie cards and navigation to detail page
- Group and movie delete functionality with danger zone pattern
- Role-based permissions using currentUserRole from API
- Wrapped all store mutations in untrack() to prevent unnecessary re-renders
- Link to create custom movie from search results
