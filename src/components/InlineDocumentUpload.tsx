import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import type { DocumentType } from '../services/api';
import { API_BASE_URL } from '../config';

interface InlineDocumentUploadProps {
  suggestedTypes: DocumentType[];
  onUpload: (s3Url: string, documentType: DocumentType, filename: string) => void;
  onDismiss: () => void;
  disabled?: boolean;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  bank_statement: 'Bank Statement',
  tax_return: 'Tax Return',
  investment_statement: 'Investment Statement',
  payslip: 'Payslip',
};

export default function InlineDocumentUpload({
  suggestedTypes,
  onUpload,
  onDismiss,
  disabled = false,
}: InlineDocumentUploadProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>(
    suggestedTypes[0] || 'bank_statement'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const validExtensions = ['.pdf', '.csv', '.txt'];
    const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      setError('Please select a PDF, CSV, or TXT file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setError(null);
    setSelectedFile(file);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', selectedType);

      const response = await fetch(`${API_BASE_URL}/api/v1/advice/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      const s3Url = data.data?.s3_url || data.s3_url;

      if (!s3Url) {
        throw new Error('No S3 URL returned from upload');
      }

      onUpload(s3Url, selectedType, selectedFile.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const documentTypes = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

  return (
    <div className="max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Document Type Selector */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select document type</p>
        <div className="flex flex-wrap gap-2">
          {documentTypes.map(([value, label]) => {
            const isSuggested = suggestedTypes.includes(value);
            const isSelected = selectedType === value;
            return (
              <button
                key={value}
                onClick={() => setSelectedType(value)}
                disabled={disabled || isUploading}
                className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : isSuggested
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {label}
                {isSuggested && !isSelected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="p-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
              : selectedFile
              ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.txt"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
          {selectedFile ? (
            <div className="space-y-1">
              <svg
                className="w-8 h-8 mx-auto text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="space-y-1">
              <svg
                className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">PDF, CSV, TXT (max 10MB)</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || disabled}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload Document
              </>
            )}
          </button>

          <button
            onClick={onDismiss}
            disabled={isUploading}
            className="w-full py-2 px-4 rounded-lg text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I'll share this information verbally instead
          </button>
        </div>
      </div>
    </div>
  );
}
