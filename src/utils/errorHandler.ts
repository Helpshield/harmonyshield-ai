import { toast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export class ValidationError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Centralized error handler for consistent error handling across the app
 */
export const handleError = (error: unknown, context?: string): AppError => {
  console.error(`Error in ${context || 'unknown context'}:`, error);

  let appError: AppError;

  if (error instanceof ValidationError) {
    appError = {
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: error.details,
    };
  } else if (error instanceof NetworkError) {
    appError = {
      message: error.message,
      code: 'NETWORK_ERROR',
      details: { statusCode: error.statusCode },
    };
  } else if (error instanceof AuthError) {
    appError = {
      message: error.message,
      code: 'AUTH_ERROR',
    };
  } else if (error instanceof Error) {
    appError = {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  } else {
    appError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  // Show user-friendly toast notification
  toast({
    title: 'Error',
    description: appError.message,
    variant: 'destructive',
  });

  return appError;
};

/**
 * Async error wrapper for consistent error handling in async functions
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
};
