import { Fragment, type PropsWithChildren, type ReactNode } from "react";
import { Popover as HPopover, Transition } from "@headlessui/react";

export default function Popover({
  children,
  button,
}: { button: ReactNode } & PropsWithChildren) {
  return (
    <HPopover className="relative z-10">
      {({ open }) => (
        <>
          <HPopover.Button
            className={`${open ? "text-white" : "text-white/90"} outline-none ring-0`}
          >
            {button}
          </HPopover.Button>
          <HPopover.Overlay className="fixed bottom-0 left-0 right-0 top-0 h-screen w-screen" />
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <HPopover.Panel className="absolute right-0 z-10 -ml-4 mt-1 rounded-md border bg-white text-sm shadow-md dark:border-gray-700 dark:bg-sgray-800">
              {children}
            </HPopover.Panel>
          </Transition>
        </>
      )}
    </HPopover>
  );
}
