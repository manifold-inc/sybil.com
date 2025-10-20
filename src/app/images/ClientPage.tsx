"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import lozad from "lozad";
import { z } from "zod";

import { Path } from "@/constant";

const Image = z.object({
  url: z.string(),
  img_src: z.string(),
  parsed_url: z.array(z.string()),
  title: z.string(),
  content: z.string().optional(),
  resolution: z.string().optional(),
  source: z.string().optional(),
});

const ImagesResponseSchema = z.array(Image);
const getDesc = (i: z.infer<typeof Image>) => {
  if (i.title.length) return i.title;
  if (i.content?.length) return i.content;
  if (i.source?.length) return i.source;
  return i.parsed_url.at(1);
};

const CONCURRENT = 20;
export const Images = ({ query }: { query: string }) => {
  const [loaded, setLoaded] = useState(0);
  const [page, setPage] = useState(1);
  const lastPage = useRef(0);
  const [images, setImages] = useState<z.infer<typeof ImagesResponseSchema>>(
    [],
  );
  const imageQuery = useMutation({
    mutationFn: async (p: number) => {
      const res = await fetch(`${Path.API.Search}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, page: p }),
      });
      return ImagesResponseSchema.parse(await res.json());
    },
    onSuccess: (r) => {
      setImages((i) => [...i, ...r]);
    },
  });
  useEffect(() => {
    if (lastPage.current === page) return;
    if (imageQuery.isLoading) return;
    lastPage.current = page;
    imageQuery.mutate(page);
    return () => imageQuery.reset();
  }, [imageQuery, page]);
  useEffect(() => {
    const lzd = lozad();
    lzd.observe();
    return () => lzd.observer.disconnect();
  }, []);

  return (
    <div className="w-screen overflow-hidden">
      <div className="flex flex-row gap-4 px-4 pt-8 sm:px-8 lg:px-36">
        <Link
          href={`/search?q=${encodeURIComponent(query)}`}
          className="relative px-0.5"
        >
          General
        </Link>
        <Link
          href={`/images?q=${encodeURIComponent(query)}`}
          className="text-mf-green-500 after:bg-mf-green-500 relative px-0.5 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:dark:bg-white"
        >
          Images
        </Link>
      </div>
      <section className="flex flex-wrap px-0.5">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={clsx(
              "m-2 flex-grow",
              idx >= loaded + CONCURRENT && "hidden",
            )}
          >
            <Link href={img.url} target="_blank" className="h-56">
              <NextImage
                alt=""
                width={384}
                height={224}
                onLoad={() => setLoaded((l) => l + 1)}
                onError={(a) => {
                  const parnetNode = a.currentTarget.parentNode?.parentNode;
                  /* @ts-expect-error this is fine */
                  parnetNode.classList.add("hidden"); // eslint-disable-line
                  setLoaded((l) => l + 1);
                }}
                src={idx < loaded + CONCURRENT ? img.img_src : ""}
                className="lozad h-56 max-w-md min-w-full rounded-xl object-cover align-bottom"
              />
            </Link>
            <div className="flex items-center gap-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
              <NextImage
                className="h-3 w-3"
                width={12}
                height={12}
                onError={(a) => a.currentTarget.classList.add("hidden")}
                src={`https://s2.googleusercontent.com/s2/favicons?domain=${img.parsed_url[1]}`}
                alt={""}
              />
              {idx < loaded + CONCURRENT ? img.parsed_url.at(1) : undefined}
            </div>
            <div className="lozad w-full max-w-sm overflow-hidden pt-0.5 text-ellipsis whitespace-nowrap text-gray-800 dark:text-gray-200">
              {getDesc(img)}
            </div>
          </div>
        ))}
      </section>
      {!imageQuery.isLoading && loaded !== 0 && (
        <div className="mx-auto w-fit py-5">
          <button
            disabled={imageQuery.isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md bg-black/10 px-2.5 py-1.5 font-semibold text-black shadow-sm hover:bg-black/20 disabled:cursor-default disabled:opacity-80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};
