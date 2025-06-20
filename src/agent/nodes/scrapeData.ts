import { WorkflowState, ETFData } from "../types";
import orchestrateScraping from "../tools/orchestrateScraping";
import { createErrorState } from "@/utils/errorHandling";
import { removeDuplicates } from "@/utils/filtering";

/**
 * Scrape Data Node
 *
 * Orchestrates data collection from multiple financial sources
 * Aggregates and deduplicates ETF data based on search terms
 */

const scrapeDataNode = async (state: WorkflowState): Promise<WorkflowState> => {
  try {
    if (!state.searchTerms || !state.preferences) {
      return createErrorState(state, "Missing search terms or preferences");
    }

    const allData: ETFData[] = [];
    const errors: string[] = [];

    for (const term of state.searchTerms) {
      try {
        const results = await orchestrateScraping(
          term.query,
          state.preferences,
        );
        allData.push(...results);
      } catch (error) {
        errors.push(`Error scraping term "${term.query}"`);
      }
    }

    if (allData.length === 0) {
      const warningMessage =
        errors.length > 0
          ? `No ETF data found. Encountered errors: ${errors.join("; ")}`
          : "No ETF data found matching your criteria. This could be due to very specific search terms or temporary data source issues.";

      // Create a minimal summary for empty data case
      const emptySummary = {
        summary: warningMessage,
        topPicks: [],
        timestamp: new Date().toISOString(),
        metadata: {
          totalETFsAnalyzed: 0,
          averageYield: 0,
          topSectors: [],
          dataQuality: "low" as const,
        },
      };

      // Skip to format_report with empty data
      return {
        ...state,
        scrapedData: [],
        summary: emptySummary,
        status: "format_report" as const,
      };
    }

    // Remove duplicates based on symbol across all search terms
    const uniqueData = removeDuplicates(allData);

    return {
      ...state,
      scrapedData: uniqueData,
      status: "summarize_data" as const,
    };
  } catch (error) {
    return createErrorState(
      state,
      error instanceof Error ? error.message : "Failed to scrape data"
    );
  }
};

export default scrapeDataNode;
