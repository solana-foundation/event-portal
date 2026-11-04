"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Clock, Coffee, Shirt, Luggage, ExternalLink } from "@/components/ui/icons";
import { StageTitle } from "@/lib/airtable/types";
import { normalizeStageTitle } from "@/lib/airtable/stages";
import { SPEAKER_GUIDE_LABEL, SPEAKER_GUIDE_NOTE, SPEAKER_GUIDE_URL } from "@/lib/site";

type StageConfig = {
  name: string;
  entrance: string;
  arrivalTime: string;
  checkInLocation: string;
};

const LOGISTICS_CONFIG = {
  shared: {
    speakerLounge: "Refer to the latest event logistics for speaker lounge access, refreshments, power, and Wi-Fi.",
    wardrobe: {
      tips: "Avoid small stripes and high‑contrast micro‑patterns.",
      jacket: "Bring an extra layer if your venue or stage area tends to run cool.",
    },
    travel: "Carry your deck on USB and keep key presentation files available offline.",
  },
};

export default function LogisticsDialogButton({ stage, stages }: { stage?: StageTitle; stages?: StageTitle[] }) {
  const uniqueStages =
    stages
      ?.map((value) => normalizeStageTitle(value))
      .filter((value, index, self): value is string => Boolean(value) && self.indexOf(value) === index) ||
    (stage ? [normalizeStageTitle(stage)].filter((value): value is string => Boolean(value)) : []);
  const stageConfigs: StageConfig[] = uniqueStages.map((name) => ({
    name,
    entrance: "Follow the latest speaker check-in directions from the event team.",
    arrivalTime: "Your check-in time will be confirmed by the speaker team.",
    checkInLocation: "the designated speaker check-in desk",
  }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          Key Information
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[42rem]">
        <DialogHeader className="pb-6 text-left">
          <p className="breakpoint-eyebrow text-[#a2a2a2]">Event day</p>
          <DialogTitle className="breakpoint-section-title text-[1.75rem] leading-[1.15] font-normal sm:text-4xl">
            Speaker logistics
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {stageConfigs.length > 0 ? (
            stageConfigs.map((stageConfig, index) => (
              <React.Fragment key={index}>
                <section className="group">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center border border-[#353535] text-white">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <h4 className="breakpoint-eyebrow text-white">
                      Venue & Stage Location{stageConfigs.length > 1 ? ` ${index + 1}` : ""}
                    </h4>
                  </div>
                  <div className="space-y-2 pl-11">
                    <p className="text-base text-white">{stageConfig.name}</p>
                    <p className="text-sm text-[#a2a2a2]">{stageConfig.entrance}</p>
                  </div>
                </section>

                <div className="h-px bg-[#353535]" />

                <section className="group">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center border border-[#353535] text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                    <h4 className="breakpoint-eyebrow text-white">
                      Arrival{stageConfigs.length > 1 ? ` ${index + 1}` : ""}
                    </h4>
                  </div>
                  <div className="space-y-2 pl-11">
                    <p className="text-base text-white">{stageConfig.arrivalTime}</p>
                    <p className="text-sm text-[#a2a2a2]">Check in at {stageConfig.checkInLocation}.</p>
                  </div>
                </section>

                {index < stageConfigs.length - 1 && <div className="h-px bg-[#353535]" />}
              </React.Fragment>
            ))
          ) : (
            <section className="group">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center border border-[#353535] text-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <h4 className="breakpoint-eyebrow text-white">Venue & Stage Location</h4>
              </div>
              <div className="space-y-2 pl-11">
                <p className="text-base text-white">
                  Venue details will appear here when stage information is assigned.
                </p>
                <p className="text-sm text-[#a2a2a2]">
                  Follow the latest event logistics and speaker check-in directions.
                </p>
              </div>
            </section>
          )}

          <div className="h-px bg-[#353535]" />

          <section className="group">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-[#353535] text-white">
                <Coffee className="h-4 w-4" />
              </div>
              <h4 className="breakpoint-eyebrow text-white">Speaker Lounge</h4>
            </div>
            <div className="pl-11">
              <p className="text-base text-white">{LOGISTICS_CONFIG.shared.speakerLounge}</p>
            </div>
          </section>

          <div className="h-px bg-[#353535]" />

          <section className="group">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-[#353535] text-white">
                <Shirt className="h-4 w-4" />
              </div>
              <h4 className="breakpoint-eyebrow text-white">Wardrobe</h4>
            </div>
            <div className="space-y-2 pl-11">
              <p className="text-base text-white">{LOGISTICS_CONFIG.shared.wardrobe.tips}</p>
              <p className="text-sm text-[#a2a2a2]">{LOGISTICS_CONFIG.shared.wardrobe.jacket}</p>
            </div>
          </section>

          <div className="h-px bg-[#353535]" />

          <section className="group">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-[#353535] text-white">
                <Luggage className="h-4 w-4" />
              </div>
              <h4 className="breakpoint-eyebrow text-white">Travel & Packing Notes</h4>
            </div>
            <div className="pl-11">
              <p className="text-base text-white">{LOGISTICS_CONFIG.shared.travel}</p>
            </div>
          </section>
          {SPEAKER_GUIDE_URL ? <div className="h-px bg-[#353535]" /> : null}

          {SPEAKER_GUIDE_URL ? (
            <section className="group">
              <div className="pl-11">
                <a
                  href={SPEAKER_GUIDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base text-white underline underline-offset-4 transition-colors hover:text-[#aa67fb]"
                >
                  {SPEAKER_GUIDE_LABEL}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                {SPEAKER_GUIDE_NOTE && <p className="mt-2 text-sm text-[#a2a2a2]">{SPEAKER_GUIDE_NOTE}</p>}
              </div>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
