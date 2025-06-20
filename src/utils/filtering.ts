import { ETFData, UserPreferences } from "@/agent/types";

/**
 * Filtering and matching utilities for ETF data
 */

/**
 * Sector matching patterns for flexible matching
 */
const SECTOR_PATTERNS: Record<string, string[]> = {
  technology: ["tech", "information", "software"],
  finance: ["financial", "bank", "insurance"],
  healthcare: ["health"],
  energy: ["energy"],
  utilities: ["utilities"],
};

/**
 * Region matching patterns for flexible matching
 */
const REGION_PATTERNS: Record<string, string[]> = {
  usa: ["us", "america", "united states"],
  global: ["international", "world", "emerging"],
  europe: ["europe"],
  asia: ["asia"],
};

/**
 * Check if a value matches any pattern in a pattern map
 */
const matchesPattern = (
  value: string,
  patternMap: Record<string, string[]>
): boolean => {
  const valueLower = value.toLowerCase();
  return Object.entries(patternMap).some(([key, patterns]) =>
    patterns.some(pattern => 
      valueLower.includes(pattern) || pattern.includes(valueLower)
    )
  );
};

/**
 * Check if ETF sector matches user preferences
 */
export const matchesSector = (
  etfSector: string,
  preferredSectors: string[]
): boolean => {
  if (preferredSectors.length === 0 || preferredSectors.includes("all")) {
    return true;
  }

  const etfSectorLower = etfSector.toLowerCase();
  
  return preferredSectors.some(sector => {
    const sectorLower = sector.toLowerCase();
    
    // Direct match
    if (etfSectorLower.includes(sectorLower) || sectorLower.includes(etfSectorLower)) {
      return true;
    }
    
    // Pattern-based matching
    return matchesPattern(etfSectorLower, SECTOR_PATTERNS);
  });
};

/**
 * Check if ETF region matches user preferences
 */
export const matchesRegion = (
  etfRegion: string,
  preferredRegions: string[]
): boolean => {
  if (preferredRegions.length === 0 || preferredRegions.includes("all") || preferredRegions.includes("global")) {
    return true;
  }

  const etfRegionLower = etfRegion.toLowerCase();
  
  return preferredRegions.some(region => {
    const regionLower = region.toLowerCase();
    
    // Direct match
    if (etfRegionLower.includes(regionLower) || regionLower.includes(etfRegionLower)) {
      return true;
    }
    
    // Pattern-based matching
    return matchesPattern(etfRegionLower, REGION_PATTERNS);
  });
};

/**
 * Check if ETF dividend yield matches user preferences
 */
export const matchesYield = (
  etfYield: number,
  minYield: number,
  maxYield: number
): boolean => {
  const tolerance = 1.5;
  return etfYield >= Math.max(0, minYield - tolerance) && 
         etfYield <= maxYield + 3.0;
};

/**
 * Filter ETFs based on user preferences
 */
export const filterETFs = (
  etfs: ETFData[],
  preferences: UserPreferences
): ETFData[] => {
  const normalizedSectors = preferences.sectors.map(s => s.toLowerCase());
  const normalizedRegions = preferences.regions.map(r => r.toLowerCase());

  return etfs.filter(etf => {
    const sectorMatch = matchesSector(etf.sector || "", normalizedSectors);
    const regionMatch = matchesRegion(etf.region || "usa", normalizedRegions);
    const yieldMatch = matchesYield(etf.dividendYield, preferences.yieldMin, preferences.yieldMax);

    return sectorMatch && regionMatch && yieldMatch;
  });
};

/**
 * Remove duplicate ETFs based on symbol
 */
export const removeDuplicates = (etfs: ETFData[]): ETFData[] => {
  return etfs.filter(
    (etf, index, self) => 
      index === self.findIndex(e => e.symbol === etf.symbol)
  );
}; 