import { match } from "ts-pattern";

import { type PromptInputSchema } from "@/server/api/main/schema";
import { CopilotSelectField } from "./select-field";
import { CopilotTextField } from "./text-field";

export function CopilotFormField(props: {
  field: PromptInputSchema.Field;
  className?: string;
}) {
  return match(props.field)
    .with({ type: "text" }, (value) => <CopilotTextField field={value} />)
    .with({ type: "select" }, (value) => <CopilotSelectField field={value} />)
    .otherwise(() => <div>{props.field.type}</div>);
}
