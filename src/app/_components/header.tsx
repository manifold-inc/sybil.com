"use client";

import ModelSelector from "./ModelSelector";
import UserBox from "./UserBox";

export default function Header() {
  return (
    <div className="fixed left-0 right-0 top-0 z-20 flex w-full justify-between gap-2 bg-mf-ash-700 p-8">
      <ModelSelector />
      <div className="flex-grow" />
      <UserBox />
    </div>
  );
}
