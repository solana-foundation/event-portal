# BP Speakers

Next.js 15 App Router app for a speaker portal and public event schedule backed by Airtable. The app serves:

- `/` for the event schedule
- `/s?key=...` for the speaker portal
- `/email-link` for requesting a magic link by email
- signed ICS feeds for single sessions, a speaker's sessions, or the full event schedule

Public event and service settings live in `src/lib/app-config.ts`. Keep credentials in environment variables.

## Stack

- Next.js 15, React 19, TypeScript
- Airtable REST API
- Luxon for venue-aware time handling
- Zod for Airtable response validation
- `ics` for calendar generation
- Tailwind CSS v4 + shadcn/ui primitives
- JWT-signed access keys for portal and calendar access
- SendGrid for magic-link email delivery

## App Structure

Main areas of the codebase:

- `src/app` routes and API handlers
- `src/lib/airtable` Airtable client, fetchers, schemas, and helpers
- `src/lib/time` timezone helpers
- `src/lib/ics` ICS generation and URL helpers
- `src/lib/app-config.ts` public event and service settings, with derived values in `src/lib/site.ts`
- `src/components` schedule UI and speaker portal UI

Important files for data issues:

- `src/lib/airtable/fetch.ts`
- `src/lib/airtable/schemas.ts`
- `src/lib/airtable/utils.ts`
- `src/app/s/page.tsx`
- `src/app/api/ics/speaker/[speakerId]/route.ts`
- `src/lib/time/tz.ts`
- `src/lib/ics/build.ts`
- `src/lib/site.ts`

## Current Routes

Pages:

- `/` event schedule
- `/s?key=...` speaker portal
- `/email-link` email-based magic-link request form

API routes:

- `POST /api/auth/request` mint a signed portal token for a speaker ID using `x-api-key`
- `POST /api/auth/request-link` look up a speaker or assistant email in Airtable and send a magic link with SendGrid
- `GET /api/sessions` return normalized sessions JSON when a valid portal key is provided
- `GET /api/sessions/[sessionId]` return a single session
- `GET /api/speakers/[speakerId]` return a single speaker when a valid portal key is provided
- `GET /api/ics/event` generate an event ICS feed, optionally filtered with `?sessions=id1,id2`
- `GET /api/ics/session/[sessionId]` generate an ICS file for one session
- `GET /api/ics/speaker/[speakerId]` generate an ICS file for a specific speaker's sessions
- `POST /api/revalidate` revalidate cached Airtable tags using a `revalidate` key

`robots.ts` currently disallows `/s/*` and all `/api/*`.

## Airtable Model

Configured Airtable table IDs in `src/lib/app-config.ts`:

- `AIRTABLE_TABLE_AGENDA`
- `AIRTABLE_TABLE_SPEAKERS`
- `AIRTABLE_TABLE_FORMATS`

Current normalized field contract lives in `src/lib/airtable/schemas.ts`.

Agenda fields in use:

- `⚙️ Session Name`
- `Description`
- `Start Time`
- `End Time`
- `Stage`
- `Onboarded Speakers`
- `Moderator`
- `Format`
- `Actions_Deck Received`
- `Portal_Telegram Group`
- `Portal_Greenlight Time`
- `Web Publishing Status`

Speaker fields in use:

- `Name`
- `First Name`
- `Last Name`
- `Role or Title`
- `Company`
- `Bio`
- `Headshot_For Web (PNG)`
- `Speaker Card (Individual)`
- `Speaker Portal Link`
- `Speaking On`
- `Moderator On`
- `Twitter`
- `Slide Deck File`
- `Luma Speaker Ticket`
- `Luma Ticket_Plus One`
- `Invitation Code`
- `25% Discount Code`
- `Dietary`
- `Speaker Permit Approval`
- `MC Info`
- `Parking Ticket`
- `YouTube Speaker Video`
- `Speaker Photo Link`

Format fields in use:

- `Format`
- `Duration (minutes)`

Known data gotchas:

- Speaker-to-session filtering must use Airtable linked record IDs, not names
- `NEXT_PUBLIC_VENUE_TZ` supports aliases like `NYC`
- Legacy Airtable stage values like `Absolute Cinema`, `Lock In`, `Cafe del Mar`, and `Etihad Arena` are normalized to generic titles in the app (`Main Stage`, `Side Stage`, `Lounge Stage`, `Arena Stage`)

## Environment

Public event details, Airtable IDs, cache behavior, URL settings, key lifetime, and SendGrid sender settings live in `src/lib/app-config.ts`. Edit that map when the event changes. `.env.example` contains only credentials. Copy it to `.env.local` and fill in the values:

```bash
AIRTABLE_PAT=
SITE_SECRET=<strong-private-secret>
API_KEY=<private-api-key>
SENDGRID_API_KEY=
```

Airtable credentials are server-only. SendGrid is optional during local development; the app logs magic links when the API key is absent. The public schedule is disabled in the map until publishing statuses are ready. The guide URL still points to the 2025 reference.

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Copy the example env file and fill in the credentials:

```bash
cp .env.example .env.local
```

Minimum local setup: `AIRTABLE_PAT`, `SITE_SECRET`, and `API_KEY`. Set `SENDGRID_API_KEY` to send email. To test links locally, change `NEXT_PUBLIC_BASE_URL` in `src/lib/app-config.ts` to `http://localhost:3000`.

3. Start the dev server:

```bash
npm run dev
```

4. Open the app:

- Schedule: `http://localhost:3000/`
- Speaker email login: `http://localhost:3000/email-link`

5. Log in as a speaker using email:

- Enter a speaker email or assistant email that exists in the Airtable speakers table
- Submit the form on `/email-link`
- Check the terminal running `npm run dev`
- The server will print both the raw token and the full login URL:

```text
[auth] token=...
[auth] link=http://localhost:3000/s?key=...
```

6. Open the logged URL in your browser to enter that speaker's portal.

## Auth Model

The app does not use user accounts or sessions.

Access is controlled with JWT-signed keys generated by `src/lib/sign.server.ts`:

- `auth` keys for portal and protected JSON routes
- `ics` keys for calendar download routes
- `revalidate` keys for cache invalidation

Portal flow:

1. Speaker enters an email on `/email-link`
2. `POST /api/auth/request-link` finds a matching Airtable speaker record
3. The app emails a magic link to `/s?key=...`
4. `/s` validates the key, extracts `speakerId`, and renders the personalized portal

Automation flow:

1. Call `POST /api/auth/request` with `x-api-key`
2. Provide `{ "speakerId": "rec..." }`
3. Use the returned token as `?key=...` on protected routes

## Caching

`src/lib/airtable/fetch.ts` uses `unstable_cache` with a 5 minute revalidation window for:

- sessions
- speakers
- individual speaker fetches
- formats

The page routes currently export `revalidate = 600` for a 10 minute page-level revalidation window.

`POST /api/revalidate` can revalidate:

- `sessions`
- `speaker`
- `speakers`

## Calendars

ICS files are generated server-side in `src/lib/ics/build.ts`.

Calendar metadata is configured in `src/lib/app-config.ts`:

- `EVENT_CALENDAR_NAME`
- `NEXT_PUBLIC_EVENT_LOCATION`
- `EVENT_GEO_LAT`
- `EVENT_GEO_LON`
- `NEXT_PUBLIC_ORGANIZER_NAME`
- `EVENT_ORGANIZER_EMAIL`

The speaker portal exposes subscribe/download links for:

- the current speaker's sessions
- all event sessions
- individual sessions

## Local Development

Install and run:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

If you are testing the email flow locally:

- configure the SendGrid env vars
- keep `SENDGRID_SANDBOX_MODE=true` until you want real delivery
- submit the form on `/email-link`

`SENDGRID_SANDBOX_MODE` is a server environment variable and defaults to `true`
when unset. Set it to `false` in Vercel for real delivery, then redeploy for the
change to take effect. Sandbox requests validate the email without delivering it
or creating SendGrid Email Activity events.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm format
pnpm format:check
pnpm test
pnpm airtable:audit
pnpm airtable:sync-portal-links
```

`airtable:sync-portal-links` reports how many records in the Greenlight view lack links. After the Breakpoint portal is deployed and verified, run it with `--write` using the deployed `SITE_SECRET`; it fills only blank `Speaker Portal Link` cells.

## Testing

The repo includes Vitest tests for utility modules and key UI components, including:

- timezone helpers
- JWT helpers
- Airtable utilities
- session and speaker presentation components

Run:

```bash
pnpm test
```
