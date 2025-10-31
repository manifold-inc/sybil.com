"use client";

import useSidebarStore from "@/app/stores/sidebar-store";
import { BanknotesIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, SparkleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "./providers";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface Chat {
  id: string;
  name: string;
}

export default function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const pathname = usePathname();
  const { status, user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: "Chat",
      href: "/",
      icon: <ChatBubbleLeftIcon className="h-5 w-5" />,
    },
    {
      label: "Models",
      href: "/models",
      icon: <SparkleIcon className="h-5 w-5" />,
    },
    {
      label: "Plans",
      href: "/plans",
      icon: <BanknotesIcon className="h-5 w-5" />,
    },
  ];

  const chats: Chat[] = [
    { id: "1", name: "TODO Chat" },
    { id: "2", name: "TODO Chat" },
    { id: "3", name: "TODO Chat" },
    { id: "4", name: "TODO Chat" },
  ];

  const userName = user?.name ?? "User";

  const handleSidebarClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) {
      return;
    }
    toggleSidebar();
  };

  const menuItems = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Make Default Search", href: "#" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 250 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={handleSidebarClick}
      className="hidden fixed left-0 top-0 z-30 sm:flex h-screen flex-col border-r border-mf-new-500 bg-mf-new-900"
    >
      {/* Toggle Button */}
      <div className="flex h-18 items-center justify-start gap-3 pl-5 px-4 text-gray-400 transition-colors hover:text-gray-200 cursor-pointer">
        <Image
          src="/sybil-bg.svg"
          alt="Sybil"
          width={32}
          height={32}
          priority
        />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium"
            >
              Close
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4 pl-5 overflow-x-hidden no-scrollbar">
        <ul className="flex flex-col">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-3 py-2 w-5/6"
              >
                <div
                  className={`flex items-center gap-3 rounded-sm h-8 w-8 transition-colors cursor-pointer border border-mf-new-500 ${
                    pathname === item.href
                      ? "bg-mf-new-500 text-gray-200"
                      : "text-gray-400 hover:bg-mf-new-500"
                  }`}
                >
                  <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          ))}
        </ul>

        {/* Chats Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              <h3 className="mb-2 px-3 text-xs font-medium text-gray-500">
                Chats
              </h3>
              <ul className="space-y-1">
                {chats.map((chat) => (
                  <li key={chat.id}>
                    <div
                      className="group flex items-center justify-between rounded-lg px-3 py-3 text-gray-400 transition-colors hover:bg-mf-new-500 hover:text-gray-200 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle chat selection here
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <ChatBubbleLeftIcon className="h-5 w-5 shrink-0" />
                        <span className="text-sm whitespace-nowrap">
                          {chat.name}
                        </span>
                      </div>
                      <button
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* User Section */}
      <div className="border-t border-mf-new-500 p-4 pl-5 relative group">
        <Link
          className="flex w-full items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          href="/settings"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-mf-new-700 border border-mf-new-500">
            <Image
              src="/user.svg"
              alt="User"
              width={16}
              height={16}
              className="h-4 w-4 text-mf-green-500"
            />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium text-gray-200 whitespace-nowrap"
              >
                {userName}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Popup Menu */}
        <div className="absolute bottom-full left-4 -mb-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="bg-mf-new-800 border border-mf-new-500 rounded-lg shadow-2xl overflow-hidden min-w-[240px] text-sm flex flex-col gap-4 py-5">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={(e) => e.stopPropagation()}
                className="block px-6 transition-colors hover:text-mf-edge-300"
              >
                {item.label}
              </Link>
            ))}
            {status === "AUTHED" ? (
              <>
                <Link
                  href="/settings"
                  className="block px-6 transition-colors hover:text-mf-edge-300"
                >
                  Settings
                </Link>
                <a
                  href="/sign-out"
                  className="block px-6 transition-colors hover:text-mf-edge-300"
                >
                  Log Out
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="block px-6 transition-colors hover:text-mf-edge-300"
                >
                  Log In
                </Link>
                <Link
                  href="/sign-up"
                  className="block px-6 transition-colors text-mf-green-500 hover:text-mf-green-100"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
