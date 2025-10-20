import type { CardSchema } from "@/server/api/main/schema";
import { MapView } from "../map-view";
import { getCardSizeStyle } from "./utils";

export function MapCard(props: {
  map: CardSchema.MapCard;
  className?: string;
}) {
  return (
    <div
      className={`max-w-full overflow-hidden rounded-md ${props.className}`}
      style={{
        ...getCardSizeStyle(props.map.size),
      }}
    >
      <MapView location={props.map.address} className="h-full w-full" />
    </div>
  );
}
