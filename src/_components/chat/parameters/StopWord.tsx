import { XMarkIcon } from "@heroicons/react/24/outline";

export const StopWord = ({
  word,
  onRemove,
}: {
  word: string;
  onRemove: () => void;
}) => {
  return (
    <div className="flex items-center bg-mf-white/25 rounded-md max-w-full cursor-pointer text-mf-sally-300 px-2 text-sm gap-1">
      <span className="truncate max-w-full">{word}</span>
      <button onClick={onRemove} className="cursor-pointer">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
