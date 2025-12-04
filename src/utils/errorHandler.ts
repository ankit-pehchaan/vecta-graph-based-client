import { ApiError } from '../services/api';

/**
 * Error handling utility for displaying backend error messages
 * in a user-friendly way, handling all edge cases.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorDetails {
  validation_errors?: ValidationError[];
  [key: string]: any;
}

/**
 * Extracts user-friendly error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extracts validation errors from API error data
 */
export function getValidationErrors(error: unknown): ValidationError[] {
  if (error instanceof ApiError && error.data) {
    const errorData = error.data as ErrorDetails;
    if (errorData.validation_errors && Array.isArray(errorData.validation_errors)) {
      return errorData.validation_errors;
    }
  }
  return [];
}

/**
 * Gets field-specific validation error message
 */
export function getFieldError(
  error: unknown,
  fieldName: string
): string | null {
  const validationErrors = getValidationErrors(error);
  const fieldError = validationErrors.find(
    (err) => err.field.toLowerCase() === fieldName.toLowerCase()
  );
  return fieldError ? fieldError.message : null;
}

/**
 * Formats error message for display
 * Handles common error patterns and makes them user-friendly
 */
export function formatErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  
  // Handle common patterns
  if (message.includes('Validation error')) {
    return 'Please check your input and try again.';
  }
  
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  
  // Return the backend message as-is for specific errors
  return message;
}

