import { WorkflowState, SummaryReport } from "../types";
import { createErrorState } from "@/utils/errorHandling";
import { 
  calculateAverageYield, 
  getUniqueValues, 
  determineDataQuality 
} from "@/utils/calculations";

/**
 * Format Report Node
 *
 * Creates final formatted report with metadata and recommendations
 * Generates user-friendly summary with investment insights
 */

const formatReportNode = async (
  state: WorkflowState,
): Promise<WorkflowState> => {
  try {
    if (!state.summary) {
      return createErrorState(state, "No summary to format");
    }

    const topPicks = state.summary.topPicks || [];
    const sectors = getUniqueValues(topPicks.map(etf => etf.sector).filter(Boolean));
    const regions = getUniqueValues(topPicks.map(etf => etf.region).filter(Boolean));

    // Calculate metadata
    const averageYield = calculateAverageYield(topPicks);
    const topSectors = sectors.slice(0, 3); // Top 3 sectors by frequency
    const dataQuality = determineDataQuality(topPicks.length);

    let summary = "";

    if (topPicks.length === 0) {
      summary = "No ETFs found matching your criteria. Please try adjusting your search parameters.";
    } else {
      summary = `Found ${topPicks.length} ETFs matching your criteria with an average dividend yield of ${averageYield.toFixed(2)}%. `;
      
      if (topSectors.length > 0) {
        summary += `Top sectors include: ${topSectors.join(", ")}. `;
      }
      
      if (regions.length > 0) {
        summary += `Regions covered: ${regions.join(", ")}. `;
      }
      
      summary += "Consider these ETFs for your dividend-focused portfolio.";
    }

    const formattedReport: SummaryReport = {
      title: "ETF Research Report",
      summary,
      topPicks,
      timestamp: new Date().toISOString(),
      metadata: {
        totalETFsAnalyzed: topPicks.length,
        averageYield,
        topSectors,
        dataQuality,
      },
    };

    return {
      ...state,
      report: formattedReport,
      status: "complete",
    };
  } catch (error) {
    return createErrorState(
      state,
      error instanceof Error ? error.message : "Failed to format report"
    );
  }
};

export default formatReportNode;
