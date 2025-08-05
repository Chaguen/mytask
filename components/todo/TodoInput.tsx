"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonText?: string;
  size?: "default" | "sm";
  variant?: "default" | "secondary";
}

export function TodoInput({
  value,
  onChange,
  onSubmit,
  placeholder = "새로운 할 일 추가...",
  buttonText = "추가",
  size = "default",
  variant = "default",
}: TodoInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className={`flex-1 ${size === "sm" ? "text-sm" : ""}`}
      />
      <Button
        onClick={onSubmit}
        size={size}
        variant={variant}
      >
        {buttonText}
      </Button>
    </div>
  );
}