import { AxiosError } from 'axios';

/**
 * Types of API error responses we might encounter
 */
interface ApiErrorResponse {
  error?: {
    message?: string;
    details?: {
      errors?: Record<string, string[]> | Array<{ message?: string } | string[]>;
    };
  };
}

/**
 * Parses various error formats into a readable string message
 */
export const parseError = (error: unknown): string => {
  try {
    // Handle Axios errors
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse;
      
      // Handle detailed validation errors
      if (errorData.error?.details?.errors) {
        const errors = errorData.error.details.errors;
        
        // Handle array of error objects
        if (Array.isArray(errors)) {
          return errors.map(err => {
            if (typeof err === 'object' && err !== null && 'message' in err) {
              return err.message;
            }
            if (Array.isArray(err)) {
              return err.join(' ');
            }
            return String(err);
          }).filter(Boolean).join(' ');
        }
        
        // Handle object with error fields
        return Object.values(errors)
          .flat()
          .join(' ');
      }
      
      // Handle simple error message
      return errorData.error?.message || 
             (typeof errorData.error === 'string' ? errorData.error : '') || 
             'An unknown error occurred';
    }
    
    // Handle standard Error objects
    if (error instanceof Error) {
      return error.message || 'An error occurred';
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unknown error occurred';
  } catch {
    return 'An unexpected error occurred';
  }
};
