import { UserPreferences, ETFData } from "../types";
import getAlphaVantageData from "./alphaVantage";
import { filterETFs, removeDuplicates } from "@/utils/filtering";

const orchestrateScraping = async (
  query: string,
  preferences: UserPreferences,
): Promise<ETFData[]> => {
  try {
    const sourceResults = await getAlphaVantageData(query);
    const filteredResults = filterETFs(sourceResults, preferences);
    return removeDuplicates(filteredResults);
  } catch (error) {
    console.error("Error in data orchestration:", error);
    return [];
  }
};

export default orchestrateScraping;
