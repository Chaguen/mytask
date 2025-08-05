"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableTodoTextProps {
  text: string;
  isEditing: boolean;
  isCompleted: boolean;
  onTextChange: (newText: string) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  className?: string;
}

export function EditableTodoText({
  text,
  isEditing,
  isCompleted,
  onTextChange,
  onEditStart,
  onEditEnd,
  className = "",
}: EditableTodoTextProps) {
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update edit text when text prop changes or when exiting edit mode
  useEffect(() => {
    setEditText(text);
  }, [text, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    const trimmedText = editText.trim();
    // Always call onTextChange to handle empty text (for deletion)
    onTextChange(trimmedText);
    // onEditEnd is handled in the parent component after text update
  };

  const handleCancel = () => {
    setEditText(text);
    onEditEnd();
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleClick = () => {
    if (!isEditing && !isCompleted) {
      onEditStart();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`h-auto py-0 px-1 border-0 focus-visible:ring-1 focus-visible:ring-offset-0 ${className}`}
        placeholder="할 일 입력..."
      />
    );
  }

  return (
    <span
      className={`cursor-pointer hover:bg-muted/50 rounded px-1 ${className}`}
      onClick={handleClick}
    >
      {text}
    </span>
  );
}