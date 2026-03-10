---
"web": minor
---

Added group create/edit form with improved validation and state management

- Implemented unified GroupForm component for creating and editing groups with real-time validation
- Added debounce utility with pending() method for async operation tracking
- Fixed race conditions in groups store when fetching single group
- Added error handling and retry logic for group edit page
- Fixed form state reset on page unmount to prevent stale data
- Extracted validation utilities, animation styles, and debounce constants to shared modules
- Simplified auth and groups stores with single query pattern
- Extracted shared page state CSS styles for loading/error states
