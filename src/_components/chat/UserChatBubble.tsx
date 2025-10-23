import { memo } from "react";

export const UserChatBubble = memo(({ content }: { content: string }) => {
  const lineCount = content.split("\n").length;
  const charCount = content.length;
  const isLongContent = lineCount > 10 || charCount > 50;

  return (
    <div
      className={`flex items-center rounded-md bg-mf-noir-300/50 px-4 py-2 max-w-full border border-mf-metal-300 ${
        isLongContent ? "sm:max-w-full" : "sm:max-w-xs"
      }`}
    >
      <p className="text-xs lg:text-sm break-words">{content}</p>
    </div>
  );
});

UserChatBubble.displayName = "UserChatBubble";
