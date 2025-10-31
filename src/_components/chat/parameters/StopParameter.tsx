import { ActionButton } from "@/_components/ActionButton";
import usePlaygroundStore from "@/app/stores/playground-store";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";

const MAX_STOPWORDS = 4;

export const StopParameter = () => {
  const { textParameters, updateTextParameter } = usePlaygroundStore();
  const [stopWords, setStopWords] = useState<string[]>(textParameters.stop);
  const [currentInput, setCurrentInput] = useState("");
  const isDisabled = stopWords.length === MAX_STOPWORDS;

  const validateWord = (word: string) =>
    word.length > 0 && !stopWords.includes(word) && !isDisabled;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addStopWord();
    }

    if (e.key === "Backspace") {
      if (currentInput.length === 0 && stopWords.length > 0) {
        const lastWord = stopWords[stopWords.length - 1];
        if (lastWord) {
          handleRemoveWord(lastWord);
        }
      }
    }
  };

  const addStopWord = () => {
    const trimmedInput = currentInput.trim();
    if (validateWord(trimmedInput)) {
      const newWords = [...stopWords, trimmedInput];
      setCurrentInput("");
      setStopWords(newWords);
      updateTextParameter("stop", newWords);
    }
  };

  const handleRemoveWord = (word: string) => {
    const newWords = stopWords.filter((w) => w !== word);
    setStopWords(newWords);
    updateTextParameter("stop", newWords);
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex items-center gap-2">
        <div className="bg-mf-ash-700 rounded-sm p-1">
          <Image src="/stop.svg" alt="Stop" width={16} height={16} priority />
        </div>
        <label htmlFor="stop" className="font-medium text-sm whitespace-nowrap">
          Stop
        </label>
        <span className="group">
          <InformationCircleIcon className="w-3 h-3 -translate-x-0.5 cursor-pointer" />
          <span className="absolute left-1/2 -translate-x-1/2 top-8 z-50 hidden w-60 whitespace-normal rounded-sm bg-mf-noir-300 px-2 py-1 text-xs group-hover:block text-center">
            <div className="flex items-center text-left gap-1">
              A string or a list of strings that, when encountered in the
              generated response, will cause the model to stop generating
              further tokens.
            </div>
          </span>
        </span>
      </div>

      <div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <input
              type="text"
              placeholder="Enter stop word..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              className="bg-mf-noir-300/50 rounded-sm px-3 py-1 text-sm focus:outline-none focus:border-mf-sally-300 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 items-center">
            <ActionButton
              width="fit"
              height="sm"
              variant="noir"
              onClick={addStopWord}
              disabled={
                isDisabled ||
                currentInput.trim().length === 0 ||
                stopWords.includes(currentInput.trim())
              }
              buttonText="Add"
            />
          </div>
        </div>

        {stopWords.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Stop Words</h3>
            <div className="flex flex-wrap gap-2 py-1">
              {stopWords.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-mf-ash-500 border border-mf-ash-300 rounded-md px-3 py-1 text-sm max-w-32"
                >
                  <span className="truncate" title={word}>
                    {word}
                  </span>
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="ml-1 p-0.5 rounded hover:bg-mf-ash-300 transition-colors"
                    title="Remove stop word"
                  >
                    <XMarkIcon className="w-3 h-3 cursor-pointer" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className=" text-xs">
                {stopWords.length} of {MAX_STOPWORDS} stop words
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
