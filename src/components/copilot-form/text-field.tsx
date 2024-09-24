import { type PromptInputSchema } from "@/server/api/main/schema";

export function CopilotTextField(props: {
  field: PromptInputSchema.TextField;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm">{props.field.description}</div>
      <input placeholder={props.field.placeholder} />
    </div>
  );
}
