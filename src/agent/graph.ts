import { END, StateGraph } from "@langchain/langgraph";
import { ResearchRequest, WorkflowState } from "./types";

// Import workflow nodes
import guardIntentNode from "./nodes/guardIntent";
import loadPreferencesNode from "./nodes/loadPreferences";
import generateSearchTermsNode from "./nodes/generateSearchTerms";
import scrapeDataNode from "./nodes/scrapeData";
import summarizeDataNode from "./nodes/summarizeData";
import formatReportNode from "./nodes/formatReport";
import generalChatNode from "./nodes/generalChat";

// -----------------------------------------------------------------------------
// Modular Workflow Paths for Dividend Investment Research Platform
// -----------------------------------------------------------------------------
//
// This graph supports two main workflows, triggered by the type of input:
//
// 1. Research Report Workflow (triggered by /api/research):
//    - Path: guard_intent -> load_preferences -> generate_search_terms -> scrape_data -> summarize_data -> format_report -> END
//    - Input: JSON object with { sectors, regions, yieldRange }
//    - Output: Structured research report for display in the Results tab.
//
// 2. AI Consultant Workflow (triggered by /api/chat):
//    - Path: guard_intent -> general_chat -> END
//    - Input: String query (user question)
//    - Output: Natural language answer for the AI Consultant chat.
//
// The guardIntentNode inspects the input and sets the workflow status to route to the correct path.
// The API endpoints /api/research and /api/chat send the appropriate input to trigger the correct workflow.
//
// -----------------------------------------------------------------------------

/**
 * Error handling node for workflow failures
 * Ensures consistent error state formatting
 */
const handleErrorNode = async (
  state: WorkflowState,
): Promise<WorkflowState> => {
  return {
    ...state,
    error: state.error || "An unexpected error occurred",
    status: "error",
  };
};

/**
 * Define the workflow state graph using LangGraph
 * Manages state transitions between different workflow nodes
 */
const workflowGraph = new StateGraph<WorkflowState>({
  channels: {
    userInput: {
      value: (prev, curr) => curr ?? prev,
    },
    researchRequest: {
      value: (prev, curr) => curr ?? prev,
    },
    status: {
      value: (prev, curr) => curr ?? prev,
    },
    error: {
      value: (prev, curr) => curr ?? prev,
    },
    preferences: {
      value: (prev, curr) => curr ?? prev,
    },
    searchTerms: {
      value: (prev, curr) => curr ?? prev,
    },
    scrapedData: {
      value: (prev, curr) => curr ?? prev,
    },
    summary: {
      value: (prev, curr) => curr ?? prev,
    },
    report: {
      value: (prev, curr) => curr ?? prev,
    },
    inputType: {
      value: (prev, curr) => curr ?? prev,
    },
  },
});

// Register workflow nodes
workflowGraph.addNode("guard_intent", guardIntentNode);
workflowGraph.addNode("load_preferences", loadPreferencesNode);
workflowGraph.addNode("generate_search_terms", generateSearchTermsNode);
workflowGraph.addNode("scrape_data", scrapeDataNode);
workflowGraph.addNode("summarize_data", summarizeDataNode);
workflowGraph.addNode("format_report", formatReportNode);
workflowGraph.addNode("general_chat", generalChatNode);
workflowGraph.addNode("handle_error", handleErrorNode);

// Configure workflow entry point
workflowGraph.setEntryPoint("guard_intent");

// Configure conditional routing for research workflow
workflowGraph.addConditionalEdges(
  "guard_intent",
  (state: WorkflowState) => {
    if (state.status === "error") return "handle_error";
    if (state.status === "general_chat") return "general_chat";
    return "load_preferences";
  },
  {
    error: "handle_error",
    general_chat: "general_chat",
    load_preferences: "load_preferences",
  },
);

workflowGraph.addConditionalEdges(
  "load_preferences",
  (state: WorkflowState) => {
    return state.status === "error" ? "handle_error" : "generate_search_terms";
  },
  {
    error: "handle_error",
    generate_search_terms: "generate_search_terms",
  },
);

workflowGraph.addConditionalEdges(
  "generate_search_terms",
  (state: WorkflowState) => {
    return state.status === "error" ? "handle_error" : "scrape_data";
  },
  {
    error: "handle_error",
    scrape_data: "scrape_data",
  },
);

workflowGraph.addConditionalEdges(
  "scrape_data",
  (state: WorkflowState) => {
    if (state.status === "error") return "handle_error";
    if (state.status === "format_report") return "format_report";
    return "summarize_data";
  },
  {
    error: "handle_error",
    format_report: "format_report",
    summarize_data: "summarize_data",
  },
);

workflowGraph.addConditionalEdges(
  "summarize_data",
  (state: WorkflowState) => {
    return state.status === "error" ? "handle_error" : "format_report";
  },
  {
    error: "handle_error",
    format_report: "format_report",
  },
);

workflowGraph.addConditionalEdges(
  "format_report",
  (state: WorkflowState) => {
    return state.status === "error" ? "handle_error" : "complete";
  },
  {
    error: "handle_error",
    complete: END,
  },
);

// Configure routing for general chat workflow
workflowGraph.addConditionalEdges(
  "general_chat",
  (state: WorkflowState) => {
    return state.status === "error" ? "handle_error" : "complete";
  },
  {
    error: "handle_error",
    complete: END,
  },
);

// Configure error handling termination
workflowGraph.addEdge("handle_error", END);

// Compile the workflow graph
const compiledGraph = workflowGraph.compile();

/**
 * Main workflow execution function
 * Handles both research requests and general chat queries
 * @param request - Either a string for chat or ResearchRequest object for research
 * @returns Promise<WorkflowState> - Final workflow state
 */
export async function runAgentWorkflow(request: string | ResearchRequest) {
  const initialState: WorkflowState = {
    userInput: typeof request === "string" ? request : undefined,
    researchRequest: typeof request === "string" ? undefined : request,
    status: "start",
  };

  try {
    const result = await compiledGraph.invoke(initialState);

    // Ensure we return a valid WorkflowState
    if (!result || typeof result !== "object") {
      return {
        ...initialState,
        status: "error" as const,
        error: "Workflow execution returned invalid result",
      };
    }

    return result;
  } catch (error) {
    return {
      ...initialState,
      status: "error" as const,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
