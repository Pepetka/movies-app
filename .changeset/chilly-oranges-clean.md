---
"web": minor
---

Extract dedicated profile module from auth and improve avatar and rating UX
• Extract dedicated profile module from auth with its own store, mutations, and form normalization
• Allow clearing avatar on the profile page and invalidate related group members and movie reviews on update
• Improve StarRatingInput rating display and layout
• Synchronize AuthProvider enum with generated types and fix validation imports
