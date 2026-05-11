---
"api": patch
---

Allow deleting users who previously added movies to groups

- Relaxed `group_movies.added_by` foreign key constraint from `onDelete: 'restrict'` to `onDelete: 'set null'`, preventing deletion failures due to referential integrity
