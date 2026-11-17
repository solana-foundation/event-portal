import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";

interface PostEventSectionProps {
  speakerPhotoLink?: string | null;
  youtubeVideoUrl?: string | null;
}

function parseMediaUrls(value?: string | null): string[] {
  return (value ?? "")
    .split(/[,\r\n]+/)
    .map((url) => url.trim())
    .filter((url) => {
      try {
        return ["https:", "http:"].includes(new URL(url).protocol);
      } catch {
        return false;
      }
    });
}

export default function PostEventSection({ speakerPhotoLink, youtubeVideoUrl }: PostEventSectionProps) {
  const photos = parseMediaUrls(speakerPhotoLink);
  const videos = parseMediaUrls(youtubeVideoUrl);
  const links = [
    ...photos.map((url, index) => ({
      url,
      label: photos.length > 1 ? `Speaker Photos ${index + 1}` : "Speaker Photos",
    })),
    ...videos.map((url, index) => ({
      url,
      label: videos.length > 1 ? `Speaker Video ${index + 1}` : "Speaker Video",
    })),
  ];

  if (links.length === 0) return null;

  return (
    <section className="space-y-10" aria-labelledby="post-event-title">
      <SectionHeading eyebrow="Post-event" title="Your photos and recordings" id="post-event-title" />
      <div className="space-y-6 border border-[#353535] bg-black p-5 sm:p-6">
        <p className="text-base leading-[1.4] text-[#a2a2a2]">Your speaker media for this event.</p>
        <ul className="unstyled-list flex flex-wrap gap-4">
          {links.map(({ url, label }, index) => (
            <li key={index} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
