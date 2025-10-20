import { CardSchema } from "@/server/api/schema";

export function getCardSizeStyle(type: CardSchema.Size) {
  if (type === "auto") {
    return {
      width: undefined,
      height: undefined,
    };
  }

  const size = CardSchema.CardSize[type];
  const widthPercent = size.cols * 100;
  const heightPercent = size.rows * 100;

  return {
    width: `${widthPercent}px`,
    height: `${heightPercent}px`,
  };
}
