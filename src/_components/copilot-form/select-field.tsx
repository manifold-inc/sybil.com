import { RadioGroup } from "@headlessui/react";

import type { PromptInputSchema } from "@/server/api/main/schema";

export function CopilotSelectField(props: {
  field: PromptInputSchema.SelectField;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="">{props.field.description}</div>
      <RadioGroup className="flex flex-wrap gap-4">
        {props.field.options.map((v, i) => (
          <RadioGroup.Option
            key={i}
            className="flex items-center gap-2"
            value={v}
          >
            {v}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  );
}
