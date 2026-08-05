# Security Specification - Kings Treat Tech (KTT)

## Data Invariants
- A booking must have a name, email, and service.
- Statuses for bookings are restricted to: 'new', 'confirmed', 'done', 'cancelled'.
- Only admins can modify services, plans, and global settings.
- Anyone can read services, plans, and global settings.
- Anyone can create a booking.
- Only admins can read or update all bookings.

## The "Dirty Dozen" Payloads
1. **Unauthorized Service Write**: Try to create a service as an unauthenticated user. (Expect: DENY)
2. **Unauthorized Settings Write**: Try to change the phone number in global settings without being an admin. (Expect: DENY)
3. **Invalid Booking Status**: Try to create a booking with status 'illegal_status'. (Expect: DENY)
4. **Anonymous Booking Read**: Try to list all bookings as a regular user. (Expect: DENY)
5. **Ghost Field in Booking**: Try to add an `isAdminVerified: true` field to a booking creation. (Expect: DENY)
6. **Huge ID Poisoning**: Try to create a booking with a document ID that is 2KB of random characters. (Expect: DENY)
7. **Tampering with Service Pricing**: Try to update a service's `basePrice` as a non-admin. (Expect: DENY)
8. **Invalid Email in Booking**: Try to create a booking with a non-string or oversized email. (Expect: DENY)
9. **Settings Wipeout**: Try to delete the `global` settings document. (Expect: DENY)
10. **Plan Escalation**: Try to create a plan with a negative price (if validation logic exists) or as a non-admin. (Expect: DENY)
11. **Booking Update Gap**: Try to update a booking as a non-admin (e.g. changing its status to 'done'). (Expect: DENY)
12. **PII Leakage**: Try to 'get' a specific booking document by ID as a non-admin. (Expect: DENY)

## Test Runner (Conceptual)
The `firestore.rules.test.ts` would verify:
- `allow read: if true` for `services`, `plans`, and `settings`.
- `allow create: if isValidBooking(incoming())` for `bookings`.
- `allow read, write: if isAdmin()` for all collections.
