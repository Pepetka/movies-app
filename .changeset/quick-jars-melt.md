---
"api": minor
---

Group invite link system with role-based authorization

- Add invite token generation, retrieval, and acceptance endpoints
- Extract BaseGroupGuard with GroupMember decorator for declarative authorization
- Restrict group movie search to moderators
- Make group operations transactional and secure response serialization
- Extract \_getGroupOrThrow helper and GroupMemberWithUser type
- Add GeneratedInviteTokenResponseDto and simplify Swagger decorators
- Use $onUpdate hook for auto-updating timestamps
- Use DB unique constraint for invite acceptance
- Move group guards to groups module
- Update E2E and service tests for new guard-based authorization
