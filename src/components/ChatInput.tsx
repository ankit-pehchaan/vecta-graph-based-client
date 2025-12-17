import { useState, FormEvent, KeyboardEvent } from 'react';
import DocumentUpload from './DocumentUpload';
import type { DocumentType } from '../services/api';

interface ChatInputProps {
  onSend: (message: string) => void;
  onDocumentUpload?: (s3Url: string, documentType: DocumentType, filename: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, onDocumentUpload, disabled = false, placeholder = 'Type a message...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleDocumentUpload = (s3Url: string, documentType: DocumentType, filename: string) => {
    if (onDocumentUpload) {
      onDocumentUpload(s3Url, documentType, filename);
    }
    setShowUpload(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2 relative">
        {/* Document Upload Popup */}
        {showUpload && onDocumentUpload && (
          <DocumentUpload
            onUpload={handleDocumentUpload}
            onClose={() => setShowUpload(false)}
            disabled={disabled}
          />
        )}

        {/* Upload Button */}
        {onDocumentUpload && (
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            disabled={disabled}
            className="flex-shrink-0 rounded-lg border border-gray-300 p-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Upload document"
            title="Upload document"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 rounded-lg bg-blue-500 p-2.5 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

