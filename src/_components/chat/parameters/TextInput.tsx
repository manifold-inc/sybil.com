import { useEffect, useRef } from "react";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  disabled: boolean;
};

export const TextInput = ({
  value,
  onChange,
  onKeyDown,
  disabled,
}: TextInputProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={disabled ? undefined : onKeyDown}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={`min-w-full bg-transparent outline-none text-sm${disabled ? " cursor-not-allowed" : ""} whitespace-nowrap overflow-hidden text-ellipsis`}
    />
  );
};
