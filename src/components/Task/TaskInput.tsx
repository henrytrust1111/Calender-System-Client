import { KeyboardEvent, memo, useEffect, useRef, useState } from "react";
import { InlineInput } from "../../styles/calendar.styles";

interface TaskInputProps {
  initialValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  onBackspaceEmpty?: () => void;
  autoFocus?: boolean;
}

const TaskInputComponent = ({
  initialValue = "",
  placeholder = "Task title",
  onSubmit,
  onCancel,
  onBackspaceEmpty,
  autoFocus = true
}: TaskInputProps) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasCommittedRef = useRef(false);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [autoFocus]);

  const commit = () => {
    if (hasCommittedRef.current) {
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      hasCommittedRef.current = true;
      onCancel?.();
      return;
    }

    hasCommittedRef.current = true;
    onSubmit(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel?.();
    }

    if (event.key === "Backspace" && value === "") {
      onBackspaceEmpty?.();
    }
  };

  return (
    <InlineInput
      ref={inputRef}
      value={value}
      placeholder={placeholder}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
};

export const TaskInput = memo(TaskInputComponent);
