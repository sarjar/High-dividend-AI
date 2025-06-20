import {
  WorkflowState,
  isValidYieldRange,
  isValidSectors,
  isValidRegions,
} from "../types";
import { createErrorState, safeJsonParse } from "@/utils/errorHandling";

/**
 * Guard Intent Node
 *
 * Validates input and determines workflow path (research vs general chat)
 * Performs input validation and routing logic
 */

const guardIntentNode = async (
  state: WorkflowState,
): Promise<WorkflowState> => {
  try {
    // Check for direct research request first
    if (state.researchRequest) {
      const { sectors, regions, yieldRange } = state.researchRequest;

      if (!isValidSectors(sectors)) {
        return createErrorState(state, "Invalid sectors: must be non-empty array of strings");
      }

      if (!isValidRegions(regions)) {
        return createErrorState(state, "Invalid regions: must be non-empty array of strings");
      }

      if (!isValidYieldRange(yieldRange)) {
        return createErrorState(state, "Invalid yield range: must be [min, max] where 0 <= min <= max <= 100");
      }

      return {
        ...state,
        status: "load_preferences",
        inputType: "research",
      };
    }

    // Handle user input if present
    if (state.userInput) {
      const trimmedInput = state.userInput.trim();

      if (!trimmedInput) {
        return createErrorState(state, "Empty user input");
      }

      // Try to parse as JSON first
      const input = safeJsonParse<{ sectors?: string[]; regions?: string[]; yieldRange?: [number, number] }>(state.userInput, {});

      if (input.sectors && input.regions && input.yieldRange) {
        if (!isValidSectors(input.sectors)) {
          return createErrorState(state, "Invalid sectors: must be non-empty array of strings");
        }

        if (!isValidRegions(input.regions)) {
          return createErrorState(state, "Invalid regions: must be non-empty array of strings");
        }

        if (!isValidYieldRange(input.yieldRange)) {
          return createErrorState(state, "Invalid yield range: must be [min, max] where 0 <= min <= max <= 100");
        }

        return {
          ...state,
          status: "load_preferences",
          inputType: "research",
        };
      }

      // If JSON parsing fails or doesn't match research format, treat as general chat
      return {
        ...state,
        status: "general_chat",
        inputType: "general",
      };
    }

    return createErrorState(state, "No valid input provided");
  } catch (error) {
    return createErrorState(
      state,
      error instanceof Error ? error.message : "Unknown error in guard intent"
    );
  }
};

export default guardIntentNode;
