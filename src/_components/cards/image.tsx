import type { CardSchema } from "@/server/api/schema";
import { getCardSizeStyle } from "./utils";

export function ImageCard(props: {
  image: CardSchema.ImageCard;
  className?: string;
}) {
  return (
    <a
      href={props.image.source ?? props.image.url}
      rel="noopener noreferrer"
      target="_blank"
      className={`overflow-hidden rounded-md ${props.className}`}
      style={{
        backgroundImage: `url(${props.image.url})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        ...getCardSizeStyle(props.image.size),
      }}
    ></a>
  );
}
