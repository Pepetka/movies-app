---
"api": minor
---

Added currentUserRole to group response for role-based permissions

- GroupsService.findOne() returns user's role in the group
- GroupResponseDto includes optional currentUserRole field
- Updated unit tests to use getGroupWithMember mock
