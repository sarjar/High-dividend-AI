import { ETFData } from "@/agent/types";

/**
 * Common calculation utilities
 */

/**
 * Calculate average of numbers, handling empty arrays
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Calculate average dividend yield from ETF data
 */
export const calculateAverageYield = (etfs: ETFData[]): number => {
  const yields = etfs
    .map(etf => etf.dividendYield)
    .filter(yieldValue => yieldValue != null && !isNaN(yieldValue));
  
  return calculateAverage(yields);
};

/**
 * Get unique values from an array
 */
export const getUniqueValues = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Get top N items by a specific property
 */
export const getTopByProperty = <T>(
  items: T[],
  property: keyof T,
  count: number
): T[] => {
  return items
    .sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return bVal - aVal;
      }
      return 0;
    })
    .slice(0, count);
};

/**
 * Determine data quality based on number of items
 */
export const determineDataQuality = (count: number): "high" | "medium" | "low" => {
  if (count >= 5) return "high";
  if (count >= 2) return "medium";
  return "low";
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}; 