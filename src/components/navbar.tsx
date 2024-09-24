"use client";

import React, { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import AskBox from "@/app/_components/AskBox";
import { useAuth } from "@/app/_components/providers";
import { Path } from "@/constant";
import {
  ALL_LANG_OPTIONS,
  changeLang,
  getLang,
  Locale,
  type Lang,
} from "@/locales";
import Popover from "./shared/popover";
import ThemeSwitcher from "./theme-switcher";

export function NavBar({ query }: { query: string }) {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-10 select-none border-b bg-white bg-opacity-80 px-4 pb-2 pt-2 backdrop-blur-lg dark:border-b-zinc-700 dark:bg-sgray-800 dark:bg-opacity-80">
      <div className="relative flex items-center justify-between pt-4 xl:w-full xl:justify-start">
        <div className="flex max-w-5xl flex-grow items-center gap-8">
          <Link
            href="/"
            className="hidden cursor-pointer items-center gap-2 rounded-md px-2 py-1 font-header text-3xl  hover:bg-gray-100 hover:opacity-100 dark:text-sgray-100 dark:hover:bg-zinc-700 sm:flex"
          >
            <Image
              className="hidden h-8 w-8 dark:block"
              width="60"
              height="60"
              alt=""
              src="/images/SybilMarkTransparentWhite.svg"
            />
            <Image
              className="h-8 w-8 dark:hidden"
              width="60"
              height="60"
              alt=""
              src="/images/SybilMarkTransparentDark.svg"
            />
            Sybil
          </Link>
          <div className="max-w-5xl flex-grow">
            <AskBox path={pathname} query={query} />
          </div>
        </div>
        <div className="ml-auto hidden xl:block">
          <UserBox />
        </div>
      </div>
      <div className="relative flex max-w-5xl items-center justify-start gap-4 pr-2 pt-4 text-sm sm:pl-8 lg:pl-36 xl:w-full">
        <Link
          href={`/search?q=${encodeURIComponent(query)}`}
          className={clsx(
            "relative px-0.5",
            pathname.startsWith("/search") &&
              "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-black after:dark:bg-white",
          )}
        >
          General
        </Link>
        <Link
          href={`/images?q=${encodeURIComponent(query)}`}
          className={clsx(
            "relative px-0.5",
            pathname.startsWith("/images") &&
              "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-black after:dark:bg-white",
          )}
        >
          Images
        </Link>
        <div className="ml-auto xl:hidden">
          <UserBox />
        </div>
      </div>
    </div>
  );
}

export function UserBox() {
  const { status } = useAuth();
  if (status === "LOADING") {
    return <div className="w-6" />;
  }
  if (status === "AUTHED") {
    return (
      <div className="relative h-6">
        <Popover
          button={
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-red-500 via-yellow-300 to-teal-500 ring-offset-1 ui-open:ring-1 ui-open:ring-gray-700 dark:ring-offset-black dark:ui-open:ring-white" />
          }
        >
          <div className="flex flex-col divide-y px-1.5 py-2 text-sm dark:divide-gray-700">
            <div className="px-2 pb-1.5">
              <ThemeSwitcher />
            </div>
            <div className="flex w-full items-center justify-between gap-2.5 px-2 py-1.5">
              <div>{Locale.Settings.Language}</div>
              <Listbox
                value={getLang()}
                onChange={(val) => changeLang(val as unknown as Lang)}
              >
                <div className="relative">
                  <Listbox.Button className="relative flex cursor-pointer gap-1 text-left focus:outline-none sm:text-sm">
                    <span className="block truncate">
                      {ALL_LANG_OPTIONS[getLang()]}
                    </span>
                    <span className="pointer-events-none">
                      <ChevronDown
                        className="h-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute right-0 mt-1 w-full min-w-28 overflow-auto rounded-md bg-white py-1 text-base text-gray-700 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      {Object.entries(ALL_LANG_OPTIONS).map(([k, v]) => (
                        <Listbox.Option
                          value={k}
                          key={k}
                          className={({ active }) =>
                            `relative cursor-pointer select-none whitespace-nowrap px-4 py-2 ${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {v}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <div className="pt-1.5">
              <a href="/sign-out" className="whitespace-nowrap px-2">
                Log Out
              </a>
            </div>
          </div>
        </Popover>
      </div>
    );
  }
  return (
    <Link
      href={Path.SignIn()}
      className="whitespace-nowrap hover:underline active:underline"
    >
      {Locale.SignIn}
    </Link>
  );
}
