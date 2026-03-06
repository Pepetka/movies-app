---
"api": patch
---

Remove password validator from login DTO

- Remove `@IsPassword()` decorator from AuthLoginDto (password validation not needed for login)
