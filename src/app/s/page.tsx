import { APP_CONFIG } from "@/lib/app-config";
import { Metadata } from "next/types";
import { generateKey, isKeyValid, getTokenPayload } from "@/lib/sign.server";
import { notFound, redirect } from "next/navigation";
import { fetchSession, getCachedFormats, getCachedSpeaker, fetchSpeakers } from "@/lib/airtable/fetch";
import { parseFormatRecord, parseSessionRecord, parseSpeakerRecord } from "@/lib/airtable/schemas";
import SpeakerCard from "@/components/speaker-card";
import SessionsCards from "@/components/sessions-cards";
import { Speaker, StageTitle } from "@/lib/airtable/types";
import { getSessionCalendarHttpUrl, getSessionsCalendarUrl, getSpeakerCalendarUrl } from "@/lib/ics/utils";
// import { Gallery } from "@/components/gallery";
import LogisticsDialogButton from "@/components/speaker-portal/LogisticsDialogButton";
import ActionsChecklist from "@/components/speaker-portal/ActionsChecklist";
import SpeakerResourceLinks from "@/components/speaker-portal/SpeakerResourceLinks";
import { getSessionDeckStatus, getSpeakerSessionIds } from "@/lib/airtable/utils";
import { EVENT_DESCRIPTION, EVENT_NAME } from "@/lib/site";
import { BreakpointHero, EventMeta } from "@/components/breakpoint-hero";

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}): Promise<Metadata> => {
  const { key } = await searchParams;
  const payload = key ? getTokenPayload(key) : null;
  const speakerId = payload?.speakerId ?? "Unknown";

  return {
    title: `${EVENT_NAME} Speaker Portal`,
    description: `${EVENT_DESCRIPTION} Speaker reference: ${speakerId}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
};

export const revalidate = 600; // 10 minutes

const getSessionRole = (session: { moderatorIds?: string[]; speakerIds?: string[] }, speakerId: string) => {
  if (session.moderatorIds?.includes(speakerId)) {
    return "Moderator" as const;
  }

  if (session.speakerIds?.includes(speakerId)) {
    return "Speaker" as const;
  }

  return null;
};

export default async function SpeakerPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;

  if (!isKeyValid(key ?? null)) {
    redirect("email-link/?expired=1");
  }

  const payload = key ? getTokenPayload(key) : null;
  const speakerId = (payload?.speakerId as string | undefined) ?? null;

  if (!speakerId) {
    notFound();
  }

  const calendarKey = generateKey(Date.now() + APP_CONFIG.NEXT_PUBLIC_KEY_EXP, "ics", speakerId);
  const speakerCalendarUrl = getSpeakerCalendarUrl(speakerId, calendarKey);

  // Generate all-sessions calendar URL (no speakerId filter)
  const allSessionsCalendarKey = generateKey(Date.now() + APP_CONFIG.NEXT_PUBLIC_KEY_EXP, "ics", speakerId);
  const allSessionsCalendarUrl = getSessionsCalendarUrl(allSessionsCalendarKey);

  // Fetch main speaker directly (cacheable - small payload)
  const speaker = await getCachedSpeaker(speakerId);
  const speakerData = parseSpeakerRecord(speaker);
  const speakerSessionIds = getSpeakerSessionIds(speaker);

  if (!speakerData) {
    notFound();
  }

  // Fetch all speakers for session mapping (uncached - payload exceeds 2MB cache limit)
  const speakers = await fetchSpeakers();
  const speakersData = speakers.map(parseSpeakerRecord);

  const sessions = await Promise.all(speakerSessionIds.map((sessionId) => fetchSession(sessionId)));
  const formats = await getCachedFormats();
  const formatLabels = new Map(
    formats.map((record) => {
      const parsed = parseFormatRecord(record);
      return [parsed.id, parsed.label];
    }),
  );
  const allSessionsData = sessions
    .map((session) => {
      const sessionData = parseSessionRecord(session);
      const participantIds = Array.from(
        new Set([...(sessionData.moderatorIds ?? []), ...(sessionData.speakerIds ?? [])]),
      );

      return {
        ...sessionData,
        subscribeUrl: getSessionCalendarHttpUrl(session.id, calendarKey),
        speakers: participantIds
          .map((id) => {
            const speaker = speakersData.find((item) => item.id === id);
            if (!speaker) {
              return null;
            }

            return {
              ...speaker,
              sessionRole: getSessionRole(sessionData, id),
            };
          })
          .filter(Boolean) as Array<Speaker & { sessionRole?: "Moderator" | "Speaker" }>,
        currentSpeakerRole: getSessionRole(sessionData, speakerId),
        format: sessionData.format?.map((formatId) => formatLabels.get(formatId)).filter(Boolean) as string[],
      };
    })
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));

  // Prepare sessions data for ActionsChecklist
  const sessionsForChecklist = allSessionsData.map((session) => {
    return {
      id: session.id,
      name: session.name,
      actionsDeckReceived: getSessionDeckStatus(session, speakerData.actionsDeckReceived),
      greenlightTime: session.greenlightTime ?? speakerData.greenlightTime ?? null,
      webPublishingStatus: session.webPublishingStatus,
    };
  });

  return (
    <div className="min-h-screen bg-black font-sans">
      <BreakpointHero title="Speaker briefing" id="portal-heading" />
      <main className="mx-auto flex max-w-[1728px] flex-col gap-12 px-4 pb-24 lg:gap-16 lg:px-8">
        <EventMeta />
        <SpeakerCard
          {...speakerData}
          sessions={sessionsForChecklist}
          dietaryStatus={speakerData.dietary}
          speakerCardUrl={speakerData.speakerCardUrl}
        />

        <SessionsCards
          items={allSessionsData}
          calendarUrl={speakerCalendarUrl}
          allSessionsCalendarUrl={allSessionsCalendarUrl}
        />

        <div className="flex flex-col gap-4 border border-[#353535] bg-black p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-2">
            <p className="breakpoint-eyebrow text-[#a2a2a2]">Event day</p>
            <p className="text-xl leading-[1.2] tracking-[-0.03rem] text-white sm:text-2xl">
              Check-in, speaker lounge, wardrobe and travel notes
            </p>
          </div>
          <LogisticsDialogButton
            stage={allSessionsData[0]?.stage}
            stages={Array.from(new Set(allSessionsData.map((s) => s.stage).filter(Boolean))) as StageTitle[]}
          />
        </div>

        <ActionsChecklist
          sessions={sessionsForChecklist}
          dietaryStatus={speakerData.dietary}
          slideDeckFile={speakerData.slideDeckFile}
          speakerTicketLink={speakerData.lumaTicketSpeaker}
          plusOneTicketLink={speakerData.lumaTicketPlusOne}
          invitationCode={speakerData.invitationCode}
          discountCode={speakerData.discountCode}
          mcInfo={speakerData.mcInfo}
          parkingTicketUrl={speakerData.parkingTicket}
          youtubeVideoUrl={speakerData.youtubeVideoUrl}
          speakerPhotoLink={speakerData.speakerPhotoLink}
        />

        <SpeakerResourceLinks />

        {/* <Separator />
        <PostEventSection /> */}
      </main>
    </div>
  );
}
