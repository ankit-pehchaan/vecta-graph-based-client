"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export default function InputBox({ onSend, disabled = false, placeholder = "Type your message...", isLoading = false }: InputBoxProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border transition-all ${
        disabled ? "border-slate-200 opacity-70" : "border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50"
      }`}
    >
      <div className="flex items-end gap-2 p-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-3 bg-transparent resize-none focus:outline-none text-slate-800 placeholder:text-slate-400 text-[15px] leading-relaxed disabled:cursor-not-allowed max-h-[150px]"
        />
        
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim() || isLoading}
          className={`p-3 rounded-xl transition-all flex-shrink-0 ${
            disabled || !message.trim() || isLoading
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
          }`}
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Hint */}
      <div className="px-4 pb-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>{message.length > 0 && `${message.length} chars`}</span>
      </div>
    </div>
  );
}
