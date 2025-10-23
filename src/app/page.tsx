import { Chat } from "@/_components/Chat";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <div className="h-2/6 w-[80%] max-w-2xl">
          <div className="flex justify-center">
            <Image src="/sybil-text.svg" alt="Sybil" width={80} height={50} />
          </div>
          <div className="py-8 sm:p-8">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}
