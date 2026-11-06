import { getSessionDeckStatus, getSessionsFilters } from "./utils";
import { DeckStatus, Session, StageValues } from "./types";

describe("getSessionDeckStatus", () => {
  test.each([
    "Keynote",
    "Product Keynote",
    "Opening",
    "Closing",
    "Keynote (10 min)",
    "Keynote (15 min)",
    "Product Keynote (5 min)",
    "Product Keynote (7 min)",
    "Opening (5 min)",
    "Closing (10 minutes)",
    "  PRODUCT  KEYNOTE (7 min)  ",
  ])("preserves upload requests for %s", (format) => {
    expect(getSessionDeckStatus({ format: [format], actionsDeckReceived: "To Do" })).toBe(DeckStatus.ToUpload);
  });

  test.each(["Fireside", "Fireside (20 min)", "Panel", "Workshop", "Keynote Panel", "recFormatId", ""])(
    "ignores session and speaker deck statuses for %s",
    (format) => {
      for (const status of Object.values(DeckStatus)) {
        expect(getSessionDeckStatus({ format: [format], actionsDeckReceived: status })).toBeNull();
        expect(getSessionDeckStatus({ format: [format], actionsDeckReceived: undefined }, status)).toBeNull();
      }
    },
  );

  test("does not request a deck when the format is missing", () => {
    expect(getSessionDeckStatus({ format: undefined, actionsDeckReceived: "To Do" }, "To Do")).toBeNull();
    expect(getSessionDeckStatus({ format: [], actionsDeckReceived: "To Do" })).toBeNull();
  });

  test("only applies a speaker-level upload request to eligible sessions", () => {
    const sessions = ["Fireside (15 min)", "Keynote (10 min)"].map((format) => ({
      format: [format],
      actionsDeckReceived: undefined,
    }));

    expect(sessions.map((session) => getSessionDeckStatus(session, "To Do"))).toEqual([null, DeckStatus.ToUpload]);
  });

  test.each([DeckStatus.Uploaded, DeckStatus.Approved])(
    "preserves session status %s over the speaker fallback",
    (status) => {
      expect(getSessionDeckStatus({ format: ["Keynote"], actionsDeckReceived: status }, "To Do")).toBe(status);
    },
  );

  test("does not invent an upload request when an eligible session has no deck status", () => {
    expect(getSessionDeckStatus({ format: ["Opening"], actionsDeckReceived: undefined })).toBeNull();
  });
});

describe("getSessionsFilters", () => {
  test("should extract unique normalized stages and dates from sessions", () => {
    const sessions: Session[] = [
      {
        id: "session-1",
        name: "Building Scalable Web Applications",
        description: "Learn how to build web applications that can handle millions of users.",
        startTime: "2025-01-15T10:00:00.000Z",
        endTime: "2025-01-15T11:00:00.000Z",
        stage: "Absolute Cinema",
        speakerIds: ["speaker-1"],
        moderatorIds: undefined,
        format: undefined,
        actionsDeckReceived: undefined,
        portalTelegramGroup: undefined,
        greenlightTime: undefined,
        webPublishingStatus: undefined,
      },
      {
        id: "session-2",
        name: "Advanced React Patterns",
        description: "Deep dive into advanced React patterns and best practices.",
        startTime: "2025-01-15T14:00:00.000Z",
        endTime: "2025-01-15T15:00:00.000Z",
        stage: "Lock In",
        speakerIds: ["speaker-2"],
        moderatorIds: undefined,
        format: undefined,
        actionsDeckReceived: undefined,
        portalTelegramGroup: undefined,
        greenlightTime: undefined,
        webPublishingStatus: undefined,
      },
      {
        id: "session-3",
        name: "Another Session on Main",
        description: "Another session on the same stage.",
        startTime: "2025-01-16T09:00:00.000Z",
        endTime: "2025-01-16T10:00:00.000Z",
        stage: StageValues.Main, // Duplicate stage after normalization
        speakerIds: ["speaker-3"],
        moderatorIds: undefined,
        format: undefined,
        actionsDeckReceived: undefined,
        portalTelegramGroup: undefined,
        greenlightTime: undefined,
        webPublishingStatus: undefined,
      },
    ];

    const result = getSessionsFilters(sessions);

    expect(result.stages).toEqual(new Set([StageValues.Main, StageValues.Side]));
    expect(result.times).toEqual(new Set(["2025-01-15", "2025-01-16"]));
  });
});
