import { redirect } from "next/navigation";
import { trackAuthEvent } from "./analytics";

/**
 * Common error handling utilities to reduce code duplication
 */

export interface ErrorWithCode extends Error {
  code?: string;
  status?: number;
  details?: string;
}

/**
 * Standardized error response for API endpoints
 */
export const createErrorResponse = (
  error: string,
  details?: string,
  status: number = 400
) => ({
  error,
  details,
  status: "error" as const,
});

/**
 * Handle Next.js redirect errors properly
 */
export const handleRedirectError = (err: unknown): void => {
  if (
    err instanceof Error &&
    (err.message === "NEXT_REDIRECT" || err.message.includes("NEXT_REDIRECT"))
  ) {
    throw err;
  }

  if (
    err &&
    typeof err === "object" &&
    "digest" in err &&
    typeof err.digest === "string" &&
    err.digest.includes("NEXT_REDIRECT")
  ) {
    throw err;
  }
};

/**
 * Standardized auth error tracking
 */
export const trackAuthError = async (
  type: "sign_in" | "sign_up" | "password_reset" | "password_update",
  email: string,
  error: string,
  metadata?: Record<string, any>
) => {
  await trackAuthEvent({
    type,
    email,
    success: false,
    error,
    metadata,
  });
};

/**
 * Standardized auth success tracking
 */
export const trackAuthSuccess = async (
  type: "sign_in" | "sign_up" | "password_reset" | "password_update",
  email: string,
  userId?: string,
  metadata?: Record<string, any>
) => {
  await trackAuthEvent({
    type,
    email,
    userId,
    success: true,
    metadata,
  });
};

/**
 * Create error state for workflow nodes
 */
export const createErrorState = (
  state: any,
  error: string,
  status: string = "error"
) => ({
  ...state,
  status,
  error,
});

/**
 * Safe JSON parsing with error handling
 */
export const safeJsonParse = <T>(input: string, fallback: T): T => {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
};

/**
 * Validate required fields with error message
 */
export const validateRequiredFields = (
  obj: Record<string, any>,
  fields: string[]
): string | null => {
  for (const field of fields) {
    if (!obj[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}; 