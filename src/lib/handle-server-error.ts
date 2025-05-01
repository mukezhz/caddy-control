import { toast } from "sonner";
import { parseError } from "./parse-error";
import { AxiosError } from "axios";

/**
 * Error severity levels for different types of errors
 */
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

/**
 * Handles API and server errors by logging them and showing user notifications
 */
export function handleServerError(error: unknown) {
  // Format error for console output
  const logDetails = getErrorDetails(error);

  // Log to console with appropriate level
  if (logDetails.severity === ErrorSeverity.ERROR) {
    console.error(logDetails.message, logDetails.details);
  } else if (logDetails.severity === ErrorSeverity.WARNING) {
    console.warn(logDetails.message, logDetails.details);
  } else {
    console.log(logDetails.message, logDetails.details);
  }

  // Get user-friendly error message
  const errorMessage = parseError(error);

  // Show toast notification with appropriate variant
  if (logDetails.severity === ErrorSeverity.ERROR) {
    toast.error(errorMessage, { duration: 5000 });
  } else if (logDetails.severity === ErrorSeverity.WARNING) {
    toast.warning(errorMessage, { duration: 5000 });
  } else {
    toast.info(errorMessage, { duration: 5000 });
  }
}

/**
 * Extracts error details and determines severity
 */
function getErrorDetails(error: unknown): {
  message: string;
  severity: ErrorSeverity;
  details: unknown;
} {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = error.response?.status;

    // Determine severity based on status code
    let severity = ErrorSeverity.ERROR;
    if (status && status < 400) severity = ErrorSeverity.INFO;
    else if (status && status < 500) severity = ErrorSeverity.WARNING;

    return {
      message: `API Error (${status}): ${error.message}`,
      severity,
      details: {
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        },
      },
    };
  }

  // Handle standard errors
  if (error instanceof Error) {
    return {
      message: `Application Error: ${error.name}`,
      severity: ErrorSeverity.ERROR,
      details: {
        message: error.message,
        stack: error.stack,
      },
    };
  }

  // Handle unknown error types
  return {
    message: "Unknown Error",
    severity: ErrorSeverity.ERROR,
    details: error,
  };
}
