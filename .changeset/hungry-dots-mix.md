---
"api": minor
---

Restrict user updates to profile fields with avatar support and normalize member/review responses
• User updates are now restricted to profile fields (name and avatar) with URL validation and empty-string normalization
• Prevent empty user patches and improve update service normalization
• Extract shared column selections in repositories for consistency and cleanup
