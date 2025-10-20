import type { CardSchema } from "@/server/api/schema";
import { getCardSizeStyle } from "./utils";

export function VideoCard(props: {
  video: CardSchema.VideoCard;
  className?: string;
}) {
  return (
    <video
      src={props.video.url}
      className={`overflow-hidden rounded-md bg-gray-400 dark:bg-zinc-800 ${props.className}`}
      controls
      style={{
        ...getCardSizeStyle(props.video.size),
      }}
    ></video>
  );
}
