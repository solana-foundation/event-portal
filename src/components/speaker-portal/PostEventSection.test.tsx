import { render, screen } from "@testing-library/react";
import { parseSpeakerRecord } from "@/lib/airtable/schemas";
import PostEventSection from "./PostEventSection";

describe("PostEventSection", () => {
  test("shows the current speaker's Airtable photos without requiring a recording", () => {
    const speaker = parseSpeakerRecord({
      id: "recSpeaker",
      fields: { "Speaker Photo Link": "https://photos.example.com/speaker-album" },
    });

    render(<PostEventSection {...speaker} />);

    expect(screen.getByRole("link", { name: "Speaker Photos" })).toHaveAttribute(
      "href",
      "https://photos.example.com/speaker-album",
    );
    expect(screen.queryByRole("link", { name: /Speaker Video/ })).not.toBeInTheDocument();
  });

  test("supports multiple photo albums and recordings separated by commas or newlines", () => {
    render(
      <PostEventSection
        speakerPhotoLink={
          " https://photos.example.com/one, https://photos.example.com/two\nhttps://photos.example.com/three "
        }
        youtubeVideoUrl="https://youtube.com/watch?v=one, https://youtube.com/watch?v=two"
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Speaker Photos 3" })).toHaveAttribute(
      "href",
      "https://photos.example.com/three",
    );
    expect(screen.getByRole("link", { name: "Speaker Video 2" })).toHaveAttribute(
      "href",
      "https://youtube.com/watch?v=two",
    );
  });

  test("keeps recordings available when photos are not populated", () => {
    render(<PostEventSection youtubeVideoUrl="https://youtube.com/watch?v=one" />);

    expect(screen.getByRole("link", { name: "Speaker Video" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Speaker Photos/ })).not.toBeInTheDocument();
  });

  test.each([undefined, "", " , \n ", "javascript:alert(1), not-a-url"])(
    "hides the section when no usable media links exist (%s)",
    (speakerPhotoLink) => {
      const { container } = render(<PostEventSection speakerPhotoLink={speakerPhotoLink} />);
      expect(container).toBeEmptyDOMElement();
    },
  );
});
