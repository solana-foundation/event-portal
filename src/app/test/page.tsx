import { BreakpointHero, EventMeta } from "@/components/breakpoint-hero";
import { Metadata } from "next/types";
import SpeakerCard from "@/components/speaker-card";
import SessionsCards from "@/components/sessions-cards";
import { Speaker, StageTitle, StageValues, DeckStatus } from "@/lib/airtable/types";
import { getSessionDeckStatus } from "@/lib/airtable/utils";
import LogisticsDialogButton from "@/components/speaker-portal/LogisticsDialogButton";
import ActionsChecklist from "@/components/speaker-portal/ActionsChecklist";
import SpeakerResourceLinks from "@/components/speaker-portal/SpeakerResourceLinks";
import { EVENT_DESCRIPTION, EVENT_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `${EVENT_NAME} Speaker Portal Preview`,
  description: EVENT_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
};

// Dummy data showing all possible states of the portal
const DUMMY_DATA = {
  speaker: {
    id: "rec123abc",
    firstName: "Hero",
    lastName: "Protagonist",
    jobTitle: "Legendary Hero",
    company: "Hero Labs",
    bio: "Hero is a passionate blockchain developer with over 10 years of experience in Web3. They specialize in smart contract development and have contributed to numerous open-source projects. When not coding, Hero enjoys speaking at conferences and mentoring new developers in the ecosystem.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    speakerCardUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop",
    xLink: "https://twitter.com/hero_p",
    xName: "hero_p",
    dietary: "Vegetarian",
    slideDeckFile: "https://google.com",
    lumaTicketSpeaker: "https://luma.com/event/tickets/speaker-123",
    lumaTicketPlusOne: "PLUS-ONE-CODE-123",
    invitationCode: "SPEAKER+1-NNNNN",
    discountCode: "GA25-NNNNN, GA25-NNNNN",
    mcInfo: "https://docs.google.com/document/d/example-mc-info-doc",
    parkingTicket: "https://example.com/parking",
    youtubeVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ, https://www.youtube.com/watch?v=abc123",
    speakerPhotoLink:
      "https://drive.google.com/file/d/example-speaker-photo-1, https://drive.google.com/file/d/example-speaker-photo-2, https://drive.google.com/file/d/example-speaker-photo-3",
  },
  sessions: [
    {
      id: "rec_session_1",
      name: "Building the Next Generation of dApps",
      description: "Join us for a deep dive into building scalable decentralized applications on Solana.",
      startTime: "2025-11-15T14:00:00Z",
      endTime: "2025-11-15T15:30:00Z",
      stage: StageValues.Main,
      speakerIds: ["rec123abc", "rec456def"],
      moderatorIds: undefined,
      subscribeUrl: `${SITE_URL}/calendar/session_1`,
      webPublishingStatus: ["Title", "Description", "Speaker"],
      format: ["Product Keynote (5 min)"],
      greenlightTime: "Between 10am and 11am",
      portalTelegramGroup: "https://t.me/event_session_1",
      actionsDeckReceived: DeckStatus.ToUpload,
      speakers: [
        {
          id: "rec123abc",
          firstName: "Hero",
          lastName: "Protagonist",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        },
        {
          id: "rec456def",
          firstName: "Jordan",
          lastName: "Smith",
          imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        },
      ] as Speaker[],
    },
    {
      id: "rec_session_2",
      name: "Panel: The Future of Web3 Infrastructure",
      description: "A panel discussion with industry leaders on the future of blockchain infrastructure.",
      startTime: "2025-11-16T10:00:00Z",
      endTime: "2025-11-16T11:00:00Z",
      stage: StageValues.Side,
      speakerIds: ["rec123abc", "rec789ghi", "rec012jkl"],
      moderatorIds: ["rec789ghi"],
      subscribeUrl: `${SITE_URL}/calendar/session_2`,
      webPublishingStatus: ["Time", "Title", "Description", "Speaker"],
      format: ["Debate (30 min)"],
      greenlightTime: undefined,
      portalTelegramGroup: "https://t.me/event_session_2",
      actionsDeckReceived: DeckStatus.Approved,
      speakers: [
        {
          id: "rec123abc",
          firstName: "Hero",
          lastName: "Protagonist",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        },
        {
          id: "rec789ghi",
          firstName: "Morgan",
          lastName: "Taylor",
          imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop",
          sessionRole: "Moderator",
        },
        {
          id: "rec012jkl",
          firstName: "Casey",
          lastName: "Brown",
          imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
          sessionRole: "Speaker",
        },
      ] as Speaker[],
      currentSpeakerRole: "Speaker" as const,
    },
    {
      id: "rec_session_4",
      name: "Opening Keynote: The State of Solana",
      description: "An annual review of Solana's growth, achievements, and what's coming next.",
      startTime: "2025-11-15T09:00:00Z",
      endTime: "2025-11-15T10:30:00Z",
      stage: StageValues.Main,
      speakerIds: ["rec123abc"],
      moderatorIds: undefined,
      subscribeUrl: `${SITE_URL}/calendar/session_4`,
      webPublishingStatus: ["Time", "Title", "Description", "Speaker"],
      format: ["Keynote (10 min)"],
      greenlightTime: undefined,
      portalTelegramGroup: undefined,
      actionsDeckReceived: DeckStatus.Uploaded,
      speakers: [
        {
          id: "rec123abc",
          firstName: "Hero",
          lastName: "Protagonist",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        },
      ] as Speaker[],
    },
  ],
};

export default function DemoSpeakerPage() {
  const { speaker, sessions } = DUMMY_DATA;

  // Dummy calendar URLs
  const calendarUrl = `${SITE_URL}/api/ics/speaker/dummy-token`;
  const allSessionsCalendarUrl = `${SITE_URL}/api/ics/event/dummy-token`;

  // Prepare sessions data for ActionsChecklist
  const sessionsForChecklist = sessions.map((session) => ({
    id: session.id,
    name: session.name!,
    actionsDeckReceived: getSessionDeckStatus(session),
    greenlightTime: session.greenlightTime,
  }));

  // Filter sessions based on webPublishingStatus (for display in cards)
  const allSessionsData = sessions;

  return (
    <div className="min-h-screen bg-black font-sans">
      <BreakpointHero title="Speaker briefing" id="portal-heading" />
      <main className="mx-auto flex max-w-[1728px] flex-col gap-12 px-4 pb-24 lg:gap-16 lg:px-8">
        <EventMeta />
        <SpeakerCard {...speaker} sessions={sessionsForChecklist} dietaryStatus={speaker.dietary} />

        <SessionsCards
          items={allSessionsData}
          calendarUrl={calendarUrl}
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
            stage={sessions[0]?.stage as StageTitle | undefined}
            stages={Array.from(new Set(sessions.map((s) => s.stage).filter(Boolean))) as StageTitle[]}
          />
        </div>

        <ActionsChecklist
          sessions={sessionsForChecklist}
          dietaryStatus={speaker.dietary}
          slideDeckFile={speaker.slideDeckFile}
          speakerTicketLink={speaker.lumaTicketSpeaker}
          plusOneTicketLink={speaker.lumaTicketPlusOne}
          invitationCode={speaker.invitationCode}
          discountCode={speaker.discountCode}
          mcInfo={speaker.mcInfo}
          parkingTicketUrl={speaker.parkingTicket}
          youtubeVideoUrl={speaker.youtubeVideoUrl}
          speakerPhotoLink={speaker.speakerPhotoLink}
        />

        <SpeakerResourceLinks />

        {/* <Separator />
        <PostEventSection /> */}
      </main>
    </div>
  );
}
