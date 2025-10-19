import { type CardSchema } from "@/server/api/main/schema";
import { getCardSizeStyle } from "./utils";

export function VideoCard(props: {
  video: CardSchema.VideoCard;
  className?: string;
}) {
  return (
    <video
      src={props.video.url}
      className={`bg-gray-400 dark:bg-zinc-800 overflow-hidden rounded-md ${props.className}`}
      controls
      style={{
        ...getCardSizeStyle(props.video.size),
      }}
    ></video>
  );
}
