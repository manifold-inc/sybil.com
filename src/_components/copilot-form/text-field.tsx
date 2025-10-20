import type { PromptInputSchema } from "@/server/api/schema";

export function CopilotTextField(props: {
  field: PromptInputSchema.TextField;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="">{props.field.description}</div>
      <input placeholder={props.field.placeholder} />
    </div>
  );
}
