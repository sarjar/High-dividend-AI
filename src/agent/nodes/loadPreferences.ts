import { WorkflowState, UserPreferences } from "../types";
import { createErrorState, validateRequiredFields } from "@/utils/errorHandling";

/**
 * Load Preferences Node
 *
 * Extracts and validates user preferences from research requests
 * Converts input data into structured UserPreferences format
 */

const loadPreferencesNode = async (
  state: WorkflowState,
): Promise<WorkflowState> => {
  try {
    // Get input from either researchRequest or userInput
    const input =
      state.researchRequest ||
      (state.userInput ? JSON.parse(state.userInput) : null);

    if (!input) {
      return createErrorState(state, "No input data available");
    }

    // Validate required fields
    const missingField = validateRequiredFields(input, ["sectors", "regions", "yieldRange"]);
    if (missingField) {
      return createErrorState(state, missingField);
    }

    const preferences: UserPreferences = {
      sectors: input.sectors,
      regions: input.regions,
      yieldMin: input.yieldRange[0],
      yieldMax: input.yieldRange[1],
    };

    return {
      ...state,
      preferences,
      status: "generate_search_terms",
    };
  } catch (error) {
    return createErrorState(
      state,
      error instanceof Error ? error.message : "Failed to load preferences"
    );
  }
};

export default loadPreferencesNode;
