# Agents Notes

Use this file first before re-exploring the repo.

## Project

- App: Next.js 15 App Router site for a speaker portal and public schedule.
- Stack: TypeScript, Airtable REST API, Luxon, Zod, ICS generation, shadcn/ui, Boxicons.
- Root paths:
  - `src/app`: routes and API handlers
  - `src/lib/airtable`: Airtable client, fetchers, schemas, helpers
  - `src/lib/time`: timezone helpers
  - `src/lib/ics`: calendar generation
  - `src/lib/site.ts`: env-driven site and event config
  - `src/components`: UI and speaker portal components

## Airtable

- Breakpoint 2026 base is `appCy7M2j24UF6QqT`. Base and PAT come from `.env.local` or `.env` via `AIRTABLE_BASE` and `AIRTABLE_PAT`.
- Current table env vars:
  - `AIRTABLE_TABLE_AGENDA=tbl802700wD64jBNI`
  - `AIRTABLE_TABLE_SPEAKERS=tbljHJh3sx1zrwMSD`
  - `AIRTABLE_TABLE_FORMATS=tbltJYMgzlVFeibNU`
- The speaker Greenlight view is `viwkuL7VXtygPpd5b` (`AIRTABLE_SPEAKER_GREENLIGHT_VIEW`). Its writable portal URL field is `Speaker Portal Link`.
- Shared URLs provided by user point to the same table IDs as above.
- Main normalized contract lives in `src/lib/airtable/schemas.ts`.

## Env-Driven Site Config

- Event identity and timezone should be treated as configuration, not hardcoded copy.
- Main config lives in `src/lib/site.ts`.
- Important env vars:
  - `DATA_CACHING_OFF`
  - `NEXT_PUBLIC_VENUE_TZ`
  - `NEXT_PUBLIC_BASE_URL`
  - `NEXT_PUBLIC_EVENT_NAME`
  - `NEXT_PUBLIC_EVENT_DATES`
  - `NEXT_PUBLIC_EVENT_SITE_URL`
  - `NEXT_PUBLIC_SITE_NAME`
  - `NEXT_PUBLIC_EVENT_DESCRIPTION`
  - `NEXT_PUBLIC_EVENT_LOCATION`
  - `NEXT_PUBLIC_ORGANIZER_NAME`
  - `NEXT_PUBLIC_SPEAKER_GUIDE_URL`
  - `NEXT_PUBLIC_SPEAKER_GUIDE_LABEL`
  - `NEXT_PUBLIC_SPEAKER_GUIDE_NOTE`
  - `NEXT_PUBLIC_HOME_SCHEDULE_ENABLED`
  - `EVENT_CALENDAR_NAME`
  - `EVENT_ORGANIZER_EMAIL`
  - `EVENT_GEO_LAT`
  - `EVENT_GEO_LON`
- If event copy, metadata, email labels, or ICS labels need changing, update env-backed config first.
- Airtable caching is on by default. Set `DATA_CACHING_OFF=true` only when you want to bypass the Next data cache.

## Important Airtable Field Mapping

- Sessions / Agenda:
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
- Speakers / Onboarded Speakers:
  - `Name`
  - `First Name`
  - `Last Name`
  - `Role or Title`
  - `Company`
  - `Bio`
  - `Headshot_For Web (PNG)`
  - `Speaker Card (Individual)`
  - `Speaker Portal Link`
  - `Publish To Web`
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
  - `Speaker Video Link` (legacy alias: `YouTube Speaker Video`)
  - `Speaker Photo Link`
- Formats:
  - `Format`
  - `Duration (minutes)`
  - `Format Description`

## Known Gotchas

- Speaker session filtering must use Airtable linked record ids, not speaker names.
- Breakpoint 2026 uses `Speaking On` and `Moderator On` linked records. `Link to Agenda` is present but currently empty.
- Current stage values include `Main Stage`, `Royal Exchange A`, and `Royal Exchange B`.
- The public schedule is off until publishing statuses are populated; the private portal shows greenlight windows.
- `NEXT_PUBLIC_VENUE_TZ` is user-configured and should support aliases like `NYC`.
- Legacy stage values may still come from Airtable:
  - `Absolute Cinema`
  - `Lock In`
  - `Cafe del Mar`
  - `Etihad Arena`
- Normalize those to generic titles in the app:
  - `Main Stage`
  - `Side Stage`
  - `Lounge Stage`
  - `Arena Stage`

## Files To Check First For Data Issues

- `src/lib/airtable/fetch.ts`
- `src/lib/airtable/schemas.ts`
- `src/lib/airtable/utils.ts`
- `src/app/s/page.tsx`
- `src/app/api/ics/speaker/[speakerId]/route.ts`
- `src/lib/time/tz.ts`
- `src/lib/ics/build.ts`
- `src/lib/site.ts`
