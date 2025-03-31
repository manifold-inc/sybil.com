import Image from "next/image";

export default function FakeHeader() {
  return (
    <div className="fixed left-0 right-0 top-0 z-20 flex w-full justify-center gap-2 bg-mf-ash-700 p-4 sm:p-8">
      <div className="flex items-center gap-2">
        <Image src="/sybil-bg.svg" alt="Sybil" width={16} height={16} />
        <span className="text-xl font-semibold text-mf-milk-300">SYBIL</span>
      </div>
    </div>
  );
}
