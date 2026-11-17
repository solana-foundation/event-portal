import * as React from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { Check, CircleMinus, Info, X } from "@/components/ui/icons";
import { DeckStatus } from "@/lib/airtable/types";
import { buildEventCouponUrl, EVENT_REGISTRATION_PLATFORM, SPEAKER_CONTACT_EMAIL } from "@/lib/site";

interface ActionsChecklistProps {
  sessions?: Array<{
    id?: string;
    name?: string;
    actionsDeckReceived?: DeckStatus | null;
  }>;
  dietaryStatus?: string | null;
  slideDeckFile?: string | null;
  speakerTicketLink?: string | null;
  plusOneTicketLink?: string | null;
  invitationCode?: string | null;
  discountCode?: string | null;
  mcInfo?: string | null;
  parkingTicketUrl?: string | null;
}

type TaskStatus = "approved" | "todo" | "pending" | "Approved" | "Denied" | "Pending";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  link: string | null;
  linkText: string | null;
  type: "task" | "info";
  codes?: string[];
};

export default function ActionsChecklist({
  sessions = [],
  dietaryStatus,
  slideDeckFile,
  speakerTicketLink,
  plusOneTicketLink,
  invitationCode,
  discountCode,
  mcInfo,
  parkingTicketUrl,
}: ActionsChecklistProps) {
  // Helper function to get dietary description
  const getDietaryDescription = (): string => {
    if (!dietaryStatus || dietaryStatus.toLowerCase() === "none") {
      return "No requirements";
    }
    return dietaryStatus;
  };

  // Parse discount codes from comma-separated string
  const parseDiscountCodes = (codes?: string | null): string[] => {
    if (!codes) return [];
    return codes
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code.length > 0);
  };

  // Create ticket tasks
  const ticketTasks = [];

  // Speaker Ticket
  if (speakerTicketLink) {
    ticketTasks.push({
      id: "speaker-ticket",
      title: "Speaker Ticket",
      description: "You can open your ticket QR code directly from the button.",
      status: "approved" as const,
      link: speakerTicketLink,
      linkText: "Open Ticket",
      type: "task" as const,
    });
  }

  // Plus One Ticket
  if (plusOneTicketLink) {
    const plusOneUrl = buildEventCouponUrl(plusOneTicketLink) ?? plusOneTicketLink;
    ticketTasks.push({
      id: "plus-one-ticket",
      title: "Plus One Ticket",
      description: "Use this link to claim your plus-one ticket.",
      status: "approved" as const,
      link: plusOneUrl,
      linkText: "Claim Plus One Ticket",
      type: "task" as const,
    });
  }

  if (invitationCode) {
    ticketTasks.push({
      id: "invitation-code",
      title: "Invitation Code",
      description: `Use this code during checkout on ${EVENT_REGISTRATION_PLATFORM}.`,
      status: "approved" as const,
      link: null,
      linkText: null,
      type: "task" as const,
      codes: [invitationCode],
    });
  }

  // Discount Codes - single action item with list of codes
  const discountCodes = parseDiscountCodes(discountCode);
  if (discountCodes.length > 0) {
    ticketTasks.push({
      id: "discount-codes",
      title: "Discount Codes",
      description: "Use these discount codes when purchasing tickets.",
      status: "approved" as const,
      link: null,
      linkText: null,
      type: "task" as const,
      codes: discountCodes,
    });
  }

  // MC Info - Google Doc link
  if (mcInfo) {
    ticketTasks.push({
      id: "mc-info",
      title: "MC Information",
      description: "Important logistics, venue locations, and guidelines for you as a MC.",
      status: "approved" as const,
      link: mcInfo,
      linkText: "View MC Info",
      type: "info" as const,
    });
  }

  // Parking Ticket - only shows if the URL field exists
  if (parkingTicketUrl) {
    ticketTasks.push({
      id: "parking-ticket",
      title: "Parking Access Ticket",
      description: "Access your event parking pass.",
      status: "approved" as const,
      link: parkingTicketUrl,
      linkText: "View Parking Pass",
      type: "info" as const,
    });
  }

  // Create deck upload tasks for each session
  // States: null, DeckStatus.ToUpload, DeckStatus.Uploaded, DeckStatus.Approved
  // Show tasks for all states except null
  const deckTasks = sessions
    .filter((session) => session.actionsDeckReceived !== null && session.actionsDeckReceived !== undefined)
    .map((session) => {
      const deckStatus = session.actionsDeckReceived;
      const isApproved = deckStatus === DeckStatus.Approved;
      const isUploaded = deckStatus === DeckStatus.Uploaded;

      // Determine task status
      let status: "approved" | "todo" | "pending";
      if (isApproved) {
        status = "approved";
      } else if (isUploaded) {
        status = "pending"; // Uploaded but awaiting approval
      } else {
        status = "todo"; // DeckStatus.ToUpload
      }

      const deckLink = isApproved
        ? null
        : slideDeckFile ||
          `mailto:${SPEAKER_CONTACT_EMAIL}?subject=${encodeURIComponent(`Deck upload link for ${session.name ?? "my session"}`)}`;

      return {
        id: `upload-deck-${session.id}`,
        title: `Deck: ${session.name ?? "Your session"}`,
        description: isApproved
          ? "Your deck is approved."
          : slideDeckFile
            ? isUploaded
              ? "Your deck is awaiting review. Use the link if you need to replace it."
              : "Upload your deck using the link provided by the speaker team."
            : "The upload link is not available yet. Ask the speaker team for it.",
        status,
        link: deckLink,
        linkText: deckLink ? (slideDeckFile ? "Open upload link" : "Ask for upload link") : null,
        type: "task" as const,
      };
    });

  const tasks: Task[] = [
    ...deckTasks,
    ...ticketTasks,
    {
      id: "dietary-requirements",
      title: "Your Dietary Requirements",
      description: getDietaryDescription(),
      status: "approved" as const,
      link: null,
      linkText: null,
      type: "info" as const,
    },
    {
      id: "stage-team-questions",
      title: "Questions",
      description: "Contact the speaker team about your session or event day.",
      status: "pending" as const,
      link: `mailto:${SPEAKER_CONTACT_EMAIL}`,
      linkText: "Email speaker team",
      type: "info" as const,
    },
  ];

  const isApproved = (task: Task) => task.status === "approved" || task.status === "Approved";
  const isTodo = (task: Task) => task.status === "todo";
  const isPending = (task: Task) => task.status === "pending" || task.status === "Pending";

  const getTaskIcon = (task: Task) => {
    if (task.type === "info") {
      return <Info className="h-5 w-5 text-[#a2a2a2]" aria-hidden="true" />;
    }
    if (isApproved(task)) {
      return <Check className="h-5 w-5 text-[#14f195]" aria-hidden="true" />;
    }
    if (task.status === "Denied") {
      return <X className="h-5 w-5 text-red-500" aria-hidden="true" />;
    }
    if (isTodo(task)) {
      return <CircleMinus className="h-5 w-5 text-[#3c91ff]" aria-hidden="true" />;
    }
    return <CircleMinus className="h-5 w-5 text-[#aa67fb]" aria-hidden="true" />;
  };

  const getStatusLabel = (task: Task): { label: string; marker: string } | null => {
    if (task.type !== "task") return null;
    if (isApproved(task)) return { label: "Approved", marker: "bg-[#14f195]" };
    if (isTodo(task)) return { label: "To do", marker: "bg-[#3c91ff]" };
    if (isPending(task)) return { label: "Pending", marker: "bg-[#aa67fb]" };
    if (task.status === "Denied") return { label: "Declined", marker: "bg-red-500" };
    return null;
  };

  const linkClass = "text-white underline underline-offset-4 transition-colors hover:text-[#aa67fb]";

  return (
    <section className="space-y-10" aria-labelledby="checklist-title">
      <SectionHeading eyebrow="Before the event" title="Actions checklist" id="checklist-title" />
      <ul className="unstyled-list grid gap-px border border-[#353535] bg-[#353535]">
        {tasks.map((task) => {
          const status = getStatusLabel(task);
          const needsAction = isTodo(task) || isPending(task) || task.status === "Denied";

          return (
            <li
              key={task.id}
              className={`flex items-start gap-4 p-4 sm:p-6 ${needsAction ? "bg-[#1e1e1e]" : "bg-black"}`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center border border-[#353535] bg-black">
                {getTaskIcon(task)}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    {status && (
                      <p className="breakpoint-eyebrow flex items-center gap-2 text-xs text-[#a2a2a2]">
                        <span aria-hidden="true" className={`size-2 ${status.marker}`} />
                        {status.label}
                      </p>
                    )}
                    <h3 className="text-xl leading-[1.2] tracking-[-0.03rem] break-words text-white sm:text-2xl">
                      {task.title}
                    </h3>
                  </div>
                  {task.link && task.linkText && (
                    <Button
                      size="lg"
                      variant={needsAction ? "default" : "outline"}
                      className="w-full max-w-full shrink-0 sm:w-auto"
                      asChild
                    >
                      <a target="_blank" rel="noopener noreferrer" href={task.link}>
                        {task.linkText}
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-base leading-[1.4] text-[#a2a2a2]">{task.description}</p>
                {task.codes && task.codes.length > 0 && (
                  <ul className="unstyled-list space-y-1 font-mono text-sm">
                    {task.codes.map((code: string, index: number) => {
                      const couponUrl = buildEventCouponUrl(code);
                      return (
                        <li key={index}>
                          {couponUrl ? (
                            <a target="_blank" rel="noopener noreferrer" href={couponUrl} className={linkClass}>
                              {code}
                            </a>
                          ) : (
                            <span
                              className="text-white"
                              title={`Use this code during checkout on ${EVENT_REGISTRATION_PLATFORM}`}
                            >
                              {code}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
