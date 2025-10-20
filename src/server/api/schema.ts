/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

export namespace CardSchema {
  export const Size = z.enum(["1x1", "1x2", "2x2", "2x4", "auto"]);
  export type Size = z.infer<typeof Size>;
  export const CardSize: Record<
    Size,
    {
      rows: number;
      cols: number;
    }
  > = {
    auto: { rows: 0, cols: 0 },
    "1x1": {
      rows: 1,
      cols: 1,
    },
    "1x2": {
      rows: 1,
      cols: 2,
    },
    "2x2": {
      rows: 2,
      cols: 2,
    },
    "2x4": {
      rows: 2,
      cols: 4,
    },
  };

  export const CommonFields = z.object({
    version: z.number().default(0),
    size: Size,
  });

  export const MapCard = z
    .object({
      type: z.literal("map"),
      address: z.string(),
      zoom: z
        .number()
        .min(1)
        .max(20)
        .default(14)
        .describe("Larger means closer"),
    })
    .merge(CommonFields);
  export type MapCard = z.infer<typeof MapCard>;

  export const WeatherCard = z
    .object({
      type: z.literal("weather"),
      address: z.string(),
    })
    .merge(CommonFields);
  export type WeatherCard = z.infer<typeof WeatherCard>;

  export const ImageCard = z
    .object({
      type: z.literal("image"),
      url: z.string().url(),
      source: z.string().url().optional(),
    })
    .merge(CommonFields);
  export type ImageCard = z.infer<typeof ImageCard>;

  export const VideoCard = z
    .object({
      type: z.literal("video"),
      url: z.string().url(),
    })
    .merge(CommonFields);
  export type VideoCard = z.infer<typeof VideoCard>;

  export const NewsCard = z
    .object({
      type: z.literal("news"),
      url: z.string().url(),
      image: z.string().url().nullish(),
      title: z.string(),
      intro: z.string().nullish(),
    })
    .merge(CommonFields);
  export type NewsCard = z.infer<typeof NewsCard>;

  export const Card = z.union([
    MapCard,
    WeatherCard,
    ImageCard,
    VideoCard,
    NewsCard,
  ]);
  export type Card = z.infer<typeof Card>;

  export const GroupCard = z.object({
    type: z.literal("group"),
    cards: z.array(Card).min(1),
  });
  export type GroupCard = z.infer<typeof GroupCard>;
}

export namespace SourceSchema {
  export const UrlSource = z.object({
    url: z.string().url(),
    thumbnail: z.string().nullish(),
    title: z.string(),
    parsed_url: z.string().array(),
    content: z.string().nullish().default(""),
    publishedDate: z.string().nullish(),
  });

  export type UrlSource = z.infer<typeof UrlSource>;
}

export namespace PromptInputSchema {
  export const TextField = z.object({
    type: z.literal("text"),
    description: z.string(),
    placeholder: z.string(),
  });
  export type TextField = z.infer<typeof TextField>;

  export const SelectField = z.object({
    type: z.literal("select"),
    description: z.string(),
    options: z.string().array(),
  });
  export type SelectField = z.infer<typeof SelectField>;

  export const Field = z.union([TextField, SelectField]);
  export type Field = z.infer<typeof Field>;
}

export namespace UserInputSchema {
  export const TextField = z.object({
    type: z.literal("text"),
    text: z.string().min(1),
  });
  export type TextField = z.infer<typeof TextField>;

  export const SelectField = z.object({
    type: z.literal("text"),
    selected: z.string().min(1),
  });
  export type SelectField = z.infer<typeof SelectField>;

  export const Field = z.union([TextField, SelectField]);
  export type Field = z.infer<typeof Field>;
}

export namespace MainSchema {
  export const UUID = z.string().min(1).uuid();
  export const GetThreadQuery = z.object({
    threadId: z.string().min(1).uuid(),
    limit: z.number().default(10).optional(),
    cursor: z.bigint().optional(),
  });

  export const CreateFile = z.object({
    key: z.string(),
    size: z.number(),
    name: z.string(),
    mime: z.string(),
  });
  export type CreateFile = z.infer<typeof CreateFile>;

  export const CreateThreadBlock = z.object({
    threadId: MainSchema.UUID,
    threadBlockId: MainSchema.UUID,
    query: z.string(),
  });
  export type CreateThreadBlock = z.infer<typeof CreateThreadBlock>;

  export const UserInputPayload = z.object({
    type: z.literal("userFormInput"),
    skipped: z.boolean().default(false),
    inputs: z.array(
      z.object({
        forInputId: UUID,
        content: UserInputSchema.Field,
      }),
    ),
  });
  export type UserInputPayload = z.infer<typeof UserInputPayload>;

  export const UpdateThreadBlockOption = z.object({
    answer: z.string(),
    sources: SourceSchema.UrlSource.array(),
    followups: z.string().array(),
    heroCard: CardSchema.Card.optional(),
    relatedCards: CardSchema.Card.array(),
    finished: z.boolean().default(false),
  });
  export type UpdateThreadBlockOption = z.infer<typeof UpdateThreadBlockOption>;
}

export namespace SearchSchema {
  export const SearchPayload = z.object({
    model: z.string(),
    query: z.string(),
    files: z.string().array(),
  });
  export type SearchPayload = z.infer<typeof SearchPayload>;

  export const QueryChunk = z.object({
    type: z.literal("search"),
    query: z.string(),
  });
  export type QueryChunk = z.infer<typeof QueryChunk>;

  export const SourcesChunk = z.object({
    type: z.literal("sources"),
    sources: SourceSchema.UrlSource.array(),
  });
  export type SourcesChunk = z.infer<typeof SourcesChunk>;

  export const CardsChunk = z.object({
    type: z.literal("cards"),
    cards: CardSchema.Card.array(),
  });
  export type CardsChunk = z.infer<typeof CardsChunk>;

  export const AnswerChunk = z.object({
    type: z.literal("answer"),
    text: z.string(),
    finished: z.boolean().default(false),
  });
  export type AnswerChunk = z.infer<typeof AnswerChunk>;

  export const RelatedChunk = z.object({
    type: z.literal("related"),
    followups: z.string().array(),
  });
  export type RelatedChunk = z.infer<typeof RelatedChunk>;

  export const HeroCardChunk = z.object({
    type: z.literal("heroCard"),
    heroCard: CardSchema.Card,
  });
  export type HeroCardChunk = z.infer<typeof HeroCardChunk>;

  export const SearchResponse = z.union([
    QueryChunk,
    SourcesChunk,
    CardsChunk,
    AnswerChunk,
    RelatedChunk,
    HeroCardChunk,
  ]);
  export type SearchResponse = z.infer<typeof SearchResponse>;
}
