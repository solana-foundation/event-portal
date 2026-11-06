import { z } from "zod";
import { airtableSpeakerSessionLinkFields } from "./config";
import { DeckStatus, Session, WEB_PUBLISHING_STATUS_MAP } from "./types";
import { normalizeStageTitle } from "./stages";

export const getZodErrorMessage = (error: z.ZodError) => {
  return error.issues.map(({ message, path }) => `${message} - ${path.join(".")}`).join(", ");
};

export interface WebPublishingStatus {
  hasTime: boolean;
  hasTitle: boolean;
  hasDescription: boolean;
  hasSpeaker: boolean;
  hasDoNotPublish: boolean;
}

export const getWebPublishingStatus = (webPublishingStatus?: string[]): WebPublishingStatus => {
  if (!webPublishingStatus || webPublishingStatus.length === 0) {
    return {
      hasTime: false,
      hasTitle: false,
      hasDescription: false,
      hasSpeaker: false,
      hasDoNotPublish: false,
    };
  }

  const flags = webPublishingStatus.map((id) => WEB_PUBLISHING_STATUS_MAP[id]).filter(Boolean);

  return {
    hasTime: flags.includes("Time"),
    hasTitle: flags.includes("Title"),
    hasDescription: flags.includes("Description"),
    hasSpeaker: flags.includes("Speaker"),
    hasDoNotPublish: flags.includes("Do not publish"),
  };
};

export const isZodError = (error: unknown): error is z.ZodError => {
  return error instanceof z.ZodError;
};

export const normalizeDeckStatus = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (value === "To Do") {
    return DeckStatus.ToUpload;
  }

  return Object.values(DeckStatus).find((status) => status === value) ?? null;
};

// Expects resolved format labels, rather than Airtable linked record IDs.
export const getSessionDeckStatus = (
  session: Pick<Session, "format" | "actionsDeckReceived">,
  speakerDeckStatus?: string | null,
) => {
  const requiresDeck = session.format?.some((label) => {
    const format = label
      .replace(/\s*\(\d+\s*min(?:utes)?\)\s*$/i, "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    return ["keynote", "product keynote", "opening", "closing"].includes(format);
  });

  return requiresDeck ? normalizeDeckStatus(session.actionsDeckReceived ?? speakerDeckStatus) : null;
};

export const getSpeakerSessionIds = (record: { fields?: Record<string, unknown> }): string[] => {
  const ids = new Set<string>();

  for (const fieldName of airtableSpeakerSessionLinkFields) {
    const value = record.fields?.[fieldName];
    if (!Array.isArray(value)) {
      continue;
    }

    for (const item of value) {
      if (typeof item === "string") {
        ids.add(item);
      }
    }
  }

  return Array.from(ids);
};

export const getSessionsFilters = (sessions: Session[]) => {
  const sets = {
    stages: new Set<string>(),
    times: new Set<string>(),
  };

  sessions.forEach((session) => {
    const normalizedStage = normalizeStageTitle(session.stage);

    if (normalizedStage) {
      sets.stages.add(normalizedStage);
    }

    if (session.startTime) {
      sets.times.add(session.startTime.split("T")[0]);
    }
  });

  return sets;
};
