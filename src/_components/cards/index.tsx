import { match } from "ts-pattern";

import type { CardSchema } from "@/server/api/schema";
import { ImageCard } from "./image";
import { MapCard } from "./map";
import { NewsCard } from "./news";
import { VideoCard } from "./video";

export function Card(props: { card: CardSchema.Card; className?: string }) {
  return match(props.card)
    .with({ type: "news" }, (news) => (
      <NewsCard news={news} className={props.className} />
    ))
    .with({ type: "map" }, (map) => (
      <MapCard map={map} className={props.className} />
    ))
    .with({ type: "image" }, (image) => (
      <ImageCard image={image} className={props.className} />
    ))
    .with({ type: "video" }, (video) => (
      <VideoCard video={video} className={props.className} />
    ))
    .otherwise((value) => <div>{value.type}</div>);
}
