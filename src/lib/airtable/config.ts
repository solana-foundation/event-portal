import { APP_CONFIG } from "@/lib/app-config";
// Update this file first when onboarding a new Airtable base for an event.
// The app reads canonical field names from these alias lists instead of hardcoding
// a single Airtable column label throughout the codebase.

export const airtableTableIds = {
  sessions: APP_CONFIG.AIRTABLE_TABLE_AGENDA,
  speakers: APP_CONFIG.AIRTABLE_TABLE_SPEAKERS,
  formats: APP_CONFIG.AIRTABLE_TABLE_FORMATS,
} as const;

export const airtableFieldMap = {
  session: {
    name: ["⚙️ Session Name", "Session"],
    description: ["Description"],
    startTime: ["Start Time"],
    endTime: ["End Time", "⚙️ End Time (Calc)"],
    stage: ["Stage"],
    speakerIds: ["Onboarded Speakers"],
    moderatorIds: ["Moderator"],
    formatIds: ["Format"],
    actionsDeckReceived: ["Actions_Deck Received"],
    portalTelegramGroup: ["Portal_Telegram Group"],
    greenlightTime: ["Portal_Greenlight Time", "Greenlight Time"],
    webPublishingStatus: ["Web Publishing Status"],
  },
  speaker: {
    name: ["Name", "Speaker Name", "Speaker's Name", "Full Name"],
    firstName: ["First Name"],
    lastName: ["Last Name"],
    jobTitle: ["Role or Title"],
    company: ["Company"],
    bio: ["Bio"],
    image: ["Headshot_For Web (PNG)", "Headshot_For Web", "Headshot"],
    speakerCard: ["Speaker Card (Individual)", "Speaker Card"],
    twitter: ["Twitter"],
    slideDeckFile: ["Slide Deck File"],
    lumaTicketSpeaker: ["Luma Speaker Ticket"],
    lumaTicketPlusOne: ["Luma Ticket_Plus One"],
    invitationCode: ["Invitation Code"],
    discountCode: ["25% Discount Code"],
    dietary: ["Dietary"],
    speakerPermitApproval: ["Speaker Permit Approval"],
    mcInfo: ["MC Info"],
    parkingTicket: ["Parking Ticket"],
    youtubeVideoUrl: ["Speaker Video Link", "YouTube Speaker Video"],
    speakerPhotoLink: ["Speaker Photo Link"],
    portalLink: ["Speaker Portal Link", "Speaker Portal"],
    actionsDeckReceived: ["Actions_Deck Received"],
    greenlightTime: ["Portal_Greenlight Time"],
    publishToWeb: ["Publish To Web", "Publish to web"],
  },
  format: {
    label: ["Format"],
    durationMinutes: ["Duration (minutes)"],
  },
} as const;

export const airtableRequiredFields = {
  session: ["name", "startTime", "endTime", "stage", "speakerIds", "formatIds"],
  speaker: ["name", "firstName", "lastName"],
  format: ["label"],
} as const;

export const airtableSpeakerSessionLinkFields = [
  "Speaking On",
  "Moderator On",
  "Link to Agenda",
  "MC On",
  "Session Assigned",
] as const;

export const airtableSpeakerContactFieldIds = {
  speakerEmail: "fldXAPcvQhbruspxA",
  assistantEmail: "fld1o4wbFWJqYrw5X",
} as const;

export const airtableWebPublishingStatusMap = {
  recwtiuTWTluBFNAE: "Time",
  recOn6L12BmGHDOno: "Title",
  recEP0WiwY2y8dx22: "Description",
  recRQY6k9lMzQnFk9: "Speaker",
  recqpel3kBGWP6Xkx: "Do not publish",
} as const;

export type AirtableEntity = keyof typeof airtableFieldMap;
export type AirtableCanonicalField<T extends AirtableEntity> = keyof (typeof airtableFieldMap)[T];

export const getFieldAliases = <T extends AirtableEntity>(entity: T, field: AirtableCanonicalField<T>) => {
  return airtableFieldMap[entity][field] as readonly string[];
};

export const getPrimaryFieldAlias = <T extends AirtableEntity>(entity: T, field: AirtableCanonicalField<T>) => {
  return getFieldAliases(entity, field)[0];
};
