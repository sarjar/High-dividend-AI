/**
 * Common string utility functions
 */

/**
 * Sanitize user input by trimming and normalizing whitespace
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, " ");
};

/**
 * Check if a string contains any of the provided keywords
 */
export const containsKeywords = (text: string, keywords: string[]): boolean => {
  const normalizedText = text.toLowerCase();
  return keywords.some(keyword => normalizedText.includes(keyword.toLowerCase()));
};

/**
 * Normalize text for comparison (lowercase, trim)
 */
export const normalizeText = (text: string): string => {
  return text.toLowerCase().trim();
};

/**
 * Check if a string is empty or only whitespace
 */
export const isEmpty = (text: string): boolean => {
  return !text || text.trim().length === 0;
};

/**
 * Extract first N words from a string
 */
export const truncateWords = (text: string, maxWords: number): string => {
  const words = text.split(/\s+/);
  return words.slice(0, maxWords).join(" ");
}; 