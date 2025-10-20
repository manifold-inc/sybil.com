import type { CardSchema } from "@/server/api/schema";
import { getCardSizeStyle } from "./utils";

export function NewsCard(props: {
  news: CardSchema.NewsCard;
  className?: string;
}) {
  return (
    <a
      className={`animate-fade block overflow-hidden rounded-md text-white opacity-100 duration-200 ${props.className}`}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        ...getCardSizeStyle(props.news.size),
      }}
      href={props.news.url}
      target="_blank"
    >
      <div className="bg-mf-green-500/15 bg-opacity-50 flex h-full w-full items-end p-6 transition-all">
        <div className="flex flex-col gap-1">
          <div className="font-sans text-xs">Top Result</div>
          <span className="line-clamp-1 text-xl">{props.news.title}</span>
          <div className="line-clamp-1 font-sans text-xs">
            {props.news.intro}
          </div>
        </div>
      </div>
    </a>
  );
}
