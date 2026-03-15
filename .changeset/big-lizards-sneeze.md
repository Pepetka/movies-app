---
"web": minor
---

Form architecture refactor with unified validation pattern and mutation simplification

- Extracted shared form styles to form-base.css for consistent styling across auth and module forms
- Unified form validation pattern: EMPTY_FORM constants, formToCreateDto/formToUpdateDto transformers, createFormFieldValidator with debounce
- Simplified AuthStore mutations to return void instead of data — consistent with isSuccess pattern
- Fixed isSuccess state after mutation reset (\_hasSucceeded now resets correctly)
- Fixed loading spinner appearing on bfcache restore (pages remain loaded when navigating back/forward)
- Added comprehensive documentation: form-patterns.md, form-styles.md, updated query-store-pattern.md
