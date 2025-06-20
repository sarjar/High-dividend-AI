import { WorkflowState } from "../types";
import getOpenAIClient from "../tools/openAIClient";
import { sanitizeInput, containsKeywords, isEmpty, normalizeText } from "@/utils/stringUtils";

/**
 * General chat node for AI consultant functionality
 * Handles user queries about finance and investment topics
 */

// System prompt for AI financial consultant
const systemPrompt = `You are a helpful, friendly AI financial consultant specializing in real-time market analysis. You provide current, up-to-date information about dividend ETFs, stocks, and investment strategies based on live market data. Always emphasize that your recommendations are based on real-time market conditions. If the question is not about finance, politely redirect the user to ask about dividend ETFs, stocks, or investment strategies. Always end with a suggestion for a follow-up question or action.`;

// Common greeting patterns for detection
const greetings = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "greetings",
];

// Financial keywords for topic detection
const financeKeywords = [
  "etf",
  "dividend",
  "stock",
  "investment",
  "portfolio",
  "yield",
  "finance",
  "financial",
  "market",
  "strategy",
  "advisor",
  "consultant",
  "trading",
  "broker",
  "fund",
  "equity",
  "bond",
  "asset",
  "return",
  "profit",
  "loss",
  "risk",
  "diversification",
  "allocation",
  "retirement",
  "401k",
  "ira",
  "roth",
  "pension",
  "savings",
  "wealth",
  "money",
  "capital",
  "income",
  "expense",
  "budget",
  "tax",
  "inflation",
  "recession",
  "bull market",
  "bear market",
  "volatility",
  "liquidity",
  "sector",
  "industry",
];

// Follow-up suggestions for user engagement
const suggestions = [
  "Would you like real-time analysis of the top dividend ETFs?",
  "Ask me about building a diversified portfolio with current market data!",
  "Curious about today's dividend yields and market conditions?",
  "Want live market insights on long-term investment strategies?",
  "Need help comparing ETFs with current market data?",
  "Interested in real-time dividend growth investing opportunities?",
  "Would you like to explore current sector-specific ETF performance?",
];

/**
 * Get a random follow-up suggestion for user engagement
 */
const getRandomSuggestion = (): string => {
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

/**
 * Check if user input is a greeting
 */
const isGreeting = (input: string): boolean => {
  const normalizedInput = normalizeText(input);
  return greetings.some(
    (greet) =>
      normalizedInput === greet ||
      normalizedInput.startsWith(greet + " ") ||
      normalizedInput.startsWith(greet + ",") ||
      normalizedInput.startsWith(greet + "!"),
  );
};

/**
 * Check if user input is finance-related
 */
const isFinanceRelated = (input: string): boolean => {
  return containsKeywords(input, financeKeywords);
};

const generalChatNode = async (
  state: WorkflowState,
): Promise<WorkflowState> => {
  try {
    if (!state.userInput) {
      return {
        ...state,
        status: "error",
        error: "No user input provided",
      };
    }

    const sanitizedInput = sanitizeInput(state.userInput);

    if (isEmpty(sanitizedInput)) {
      return {
        ...state,
        status: "error",
        error: "Empty user input after sanitization",
      };
    }

    // Handle greetings/small talk
    if (isGreeting(sanitizedInput)) {
      return {
        ...state,
        report: {
          title: "AI Financial Consultant",
          summary: `Hello! 👋 I'm your AI financial consultant specializing in real-time market analysis. I provide current dividend ETF data, live market insights, and up-to-date investment strategies. How can I help you with today's market opportunities?\n\n${getRandomSuggestion()}`,
          topPicks: [],
          timestamp: new Date().toISOString(),
        },
        status: "complete",
      };
    }

    // Check if the query is finance-related
    if (!isFinanceRelated(sanitizedInput)) {
      return {
        ...state,
        report: {
          title: "AI Financial Consultant",
          summary: `I specialize in real-time financial market analysis, focusing on dividend ETFs, stocks, and current investment strategies. Please ask me something related to finance and investing for the most current market insights.\n\n${getRandomSuggestion()}`,
          topPicks: [],
          timestamp: new Date().toISOString(),
        },
        status: "complete",
      };
    }

    // Use the LLM for finance-related queries
    const llm = getOpenAIClient();
    const prompt = `${systemPrompt}\n\nUser: ${sanitizedInput}`;

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await llm.invoke(prompt);

    console.log("Received response from OpenAI:", response);

    // Handle different response structures from LangChain ChatOpenAI
    let responseContent: string;

    if (typeof response.content === "string") {
      responseContent = response.content;
    } else if (Array.isArray(response.content)) {
      responseContent = response.content.join("");
    } else {
      throw new Error("Invalid response format from OpenAI");
    }

    if (isEmpty(responseContent)) {
      throw new Error("Empty response from OpenAI");
    }

    console.log("Processed response content:", responseContent);

    return {
      ...state,
      report: {
        title: "AI Financial Consultant",
        summary: `${responseContent.trim()}\n\n${getRandomSuggestion()}`,
        topPicks: [],
        timestamp: new Date().toISOString(),
      },
      status: "complete",
    };
  } catch (error) {
    return {
      ...state,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error in general chat",
    };
  }
};

export default generalChatNode;
