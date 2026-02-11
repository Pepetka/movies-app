---
"api": minor
---

Add groups and movies functionality with role-based access control and Kinopoisk integration

- Groups module — create groups, manage members, roles (owner/admin/member) and ownership transfer
- Movies module — search movies via Kinopoisk API integration
- Custom movies module — user-defined movies with custom data
- Group movies module — add movies to groups with statuses (watched, planned, etc.)
- Domain infrastructure — exceptions, guards, decorators, validators for groups and movies
- Database schemas — new tables: groups, group_members, group_movies, custom_movies
- Documentation — API plan and architecture
