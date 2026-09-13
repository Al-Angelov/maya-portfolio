// Feature: maija-portfolio
//
// PhotoFrame (Req 5.5). A presentational placeholder image frame reserved for
// Maija's professional photo. It renders a bordered frame around the
// placeholder asset shipped under public/images so the Info_Page can reserve
// the space until a real photo is provided.

export interface PhotoFrameProps {
  /** Optional accessible label for the frame image. */
  alt?: string;
}

/** Path to the static placeholder asset (served from public/, Req 1.1). */
const PHOTO_FRAME_PLACEHOLDER = "/images/info-photo-frame-placeholder.svg";

export default function PhotoFrame({
  alt = "Placeholder reserved for a professional photo of Maija",
}: PhotoFrameProps) {
  return (
    <div
      data-testid="photo-frame"
      className="mx-auto aspect-[3/4] w-full max-w-md overflow-hidden bg-warmIvory md:max-w-none"
    >
      <img
        src={PHOTO_FRAME_PLACEHOLDER}
        alt={alt}
        className="block h-full w-full object-cover"
      />
    </div>
  );
}
