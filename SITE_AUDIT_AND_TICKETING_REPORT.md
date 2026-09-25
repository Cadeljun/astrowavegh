# AstroWave Site Audit and Mask Mirage Ticketing Update

## Executive summary

The AstroWave site has a strong visual direction and already contains the main building blocks for events, talent management, bookings, scanning, ticket retrieval, and Paystack payments. The most urgent issue was not visual: the ticket flow could generate duplicate or unverifiable tickets because the Paystack webhook and callback each generated their own ticket set. The Mask Mirage purchase flow has now been consolidated into one idempotent fulfillment service with stable ticket IDs, persisted QR codes, email confirmation, and retryable email delivery.

The implementation was pushed to GitHub in commit `f6d8654`.

## Implemented in this update

| Area | Update |
| --- | --- |
| Payment initialization | Server-side price validation now supports Standard, Group of 4, and Complimentary tickets with quantity rules. Buyer phone numbers are preserved in payment metadata. |
| Payment fulfillment | Paystack webhook and callback use the same idempotent fulfillment service keyed by payment reference. Repeated webhook/callback delivery cannot create duplicate tickets. |
| Ticket identifiers | Generated tickets use the scanner-compatible `MM26-XXXXXXXX` format, derived deterministically from the payment reference and ticket index. |
| QR generation | A QR code is generated for every ticket, uploaded to Cloudinary, stored with the ticket record, and encoded with the ticket ID used by the scanner. |
| Confirmation email | Resend confirmation emails include the buyer, event details, ticket IDs, QR images, and instructions. Email delivery failures are recorded and retried through the fulfillment path. |
| Buyer experience | The post-payment page invokes the secure fulfillment fallback, shows generated QR codes, and exposes a downloadable branded Mask Mirage ticket. |
| Server security | Payment fulfillment now writes through Firebase Admin rather than relying on browser Firestore permissions. |
| Configuration | Added Paystack, Resend, Firebase Admin, and email sender variables to `.env.example`. |

## Required production configuration

The following values must be configured in the production environment before live purchase testing:

```env
PAYSTACK_SECRET_KEY=...
PAYSTACK_WEBHOOK_SECRET=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=AstroWave Tickets <tickets@astrowavegh.com>
RESEND_REPLY_TO=astrowaveevent@gmail.com
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Paystack must send `charge.success` events to:

```text
https://astrowavegh.com/api/paystack/webhook
```

The sender domain used by Resend must be verified. If `tickets@astrowavegh.com` is not verified, use a verified sender address instead. Cloudinary must permit the server-side ticket upload folder `Astrowave/Tickets`.

## Priority site improvements

### P0 — before taking real payments

The production environment should be configured and tested with a Paystack test transaction. The test should confirm that one payment creates the expected number of Firestore ticket records, each ticket has a unique QR image, the scanner accepts the QR payload, the callback page displays the same ticket set, and one confirmation email arrives. The same payment reference should then be replayed against the webhook to verify idempotency.

Firestore rules should be reviewed specifically for `tickets`, `payment_events`, `qrcodes`, and administrative collections. Public clients should not be able to create or modify tickets, payment events, or scanner results. Ticket check-in should move to a trusted server endpoint or a tightly protected staff workflow with atomic state transitions to prevent two scanners from accepting the same ticket at the same time.

The scanner currently relies on a browser `sessionStorage` flag for access control. That is not sufficient for a production entrance operation. Replace it with Firebase Auth or a server-issued staff session and enforce staff authorization on the verification API.

### P1 — reliability and maintainability

The production build still emits an unrelated warning because `src/app/api/match/run/route.ts` imports `runMatchingEngine`, which is not exported from the matching-engine module. This should be corrected before the next broad release. The repository-wide TypeScript check also contains pre-existing failures involving duplicate component casing and missing platform type exports; these should be resolved so future ticketing regressions are easier to detect.

The project currently reports 87 npm audit vulnerabilities, including high and critical findings. Run the audit by dependency path, update non-breaking packages first, and schedule a controlled dependency upgrade for the remaining high-risk packages. Avoid using `npm audit fix --force` blindly because it can introduce framework-breaking changes.

Ticket inventory is not yet decremented atomically. If limited ticket quantities matter for Mask Mirage, add an event inventory document and use a transaction or server-side counter reservation before initializing Paystack. This prevents overselling during concurrent purchases.

### P2 — product and conversion improvements

The public event, checkout, and ticket pages should share one event record rather than relying on duplicated Mask Mirage fallback constants. Once the production Firestore event is seeded, the public detail page, ticket checkout, confirmation email, and admin event editor should all read the same title, image, venue, date, and tier data.

The customer ticket lookup page currently searches by email alone. Add a second verification factor such as ticket ID plus email, or a signed access link, to reduce exposure of ticket records. Add an explicit resend-confirmation action with rate limiting and a support path for email typos.

Add an admin ticket operations view with filters for payment reference, ticket status, email, ticket type, and check-in time. Include a controlled resend-email action and an audit trail for cancellations, refunds, manual check-ins, and overrides.

Improve checkout copy around the Complimentary tier. The current GH¢0.20 amount is technically supported but may be confusing to customers; either explain the processing/verification charge or change the product label and amount to match the actual business intent.

### P3 — polish, SEO, and observability

Add structured event schema and consistent metadata for the Mask Mirage detail page, including the exact date, venue, ticket offers, image, and availability. Add error tracking around Paystack initialization, webhook processing, QR upload, email delivery, and scanner verification with payment-reference correlation IDs.

The site has a polished creative identity, but several sections still use duplicated styling conventions and parallel UI component files with case differences such as `Button.tsx` and `button.tsx`. Consolidate component casing and shared tokens to reduce platform-specific build issues.

Review accessibility across the public and admin experiences: keyboard focus states in checkout, labels and error announcements in forms, reduced-motion behavior, contrast for gold-on-dark text, and descriptive alt text for event artwork.

## Validation performed

The changed payment, QR, email, Firebase Admin, checkout, and confirmation files have no TypeScript diagnostics. The production build completes successfully after lazy initialization of Resend. The build still reports the unrelated matching-engine import warning described above. The repository-wide TypeScript command still exits non-zero because of pre-existing errors outside this ticketing implementation.

A live payment was not executed during this update because production Paystack, Resend, Cloudinary, and Firebase Admin credentials were not present in the sandbox. The required configuration and exact webhook URL are documented above.
