"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function InputBox({ onSend, disabled = false, placeholder = "Type your message..." }: InputBoxProps) {
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
          disabled={disabled || !message.trim()}
          className={`p-3 rounded-xl transition-all flex-shrink-0 ${
            disabled || !message.trim()
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
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
