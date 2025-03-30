"use client";

import { useEffect, useRef, useState } from "react";
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
              <img
                alt=""
                onLoad={() => setLoaded((l) => l + 1)}
                onError={(a) => {
                  const parnetNode = a.currentTarget.parentNode?.parentNode;
                  /* @ts-expect-error this is fine */
                  parnetNode.classList.add("hidden"); // eslint-disable-line
                  setLoaded((l) => l + 1);
                }}
                src={idx < loaded + CONCURRENT ? img.img_src : undefined}
                loading="lazy"
                className="lozad h-56 min-w-full max-w-md rounded-xl object-cover align-bottom"
              />
            </Link>
            <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 pt-1 text-xs">
              <img
                className="h-3 w-3"
                onError={(a) => a.currentTarget.classList.add("hidden")}
                src={`https://s2.googleusercontent.com/s2/favicons?domain=${img.parsed_url[1]}`}
                loading="lazy"
                alt={""}
              />
              {idx < loaded + CONCURRENT ? img.parsed_url.at(1) : undefined}
            </div>
            <div className="lozad text-gray-800 dark:text-gray-200 w-full max-w-sm overflow-hidden text-ellipsis  whitespace-nowrap pt-0.5">
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
            className="bg-black/10 text-black hover:bg-black/20 dark:bg-white/10  dark:text-white dark:hover:bg-white/20 rounded-md px-2.5 py-1.5 font-semibold shadow-sm disabled:cursor-default disabled:opacity-80"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};
