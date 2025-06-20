import axios from "axios";
import { ETFData } from "../types";
import { globalRateLimiter } from "./rateLimiter";

interface AlphaVantageETFProfile {
  symbol: string;
  name: string;
  exchange: string;
  assetType: string;
  ipoDate: string;
  delistingDate?: string;
  status: string;
}

interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
}

interface AlphaVantageOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  DividendYield: string;
  ExDividendDate: string;
  DividendDate: string;
  DividendPerShare: string;
  MarketCapitalization: string;
  BookValue: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  "52WeekHigh": string;
  "52WeekLow": string;
  "50DayMovingAverage": string;
  "200DayMovingAverage": string;
  SharesOutstanding: string;
}

interface AlphaVantageSearchResult {
  "1. symbol": string;
  "2. name": string;
  "3. type": string;
  "4. region": string;
  "5. marketOpen": string;
  "6. marketClose": string;
  "7. timezone": string;
  "8. currency": string;
  "9. matchScore": string;
}

interface AlphaVantageSearchResponse {
  bestMatches: AlphaVantageSearchResult[];
}

const getAlphaVantageData = async (query: string): Promise<ETFData[]> => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    console.log("Alpha Vantage API key not configured");
    return [];
  }

  try {
    // Apply rate limiting (Alpha Vantage has 5 calls per minute for free tier)
    await globalRateLimiter.waitIfNeeded("alpha-vantage");

    const results: ETFData[] = [];
    const symbolsToCheck: string[] = [];

    // First, search for ETFs based on the query
    if (query.trim()) {
      try {
        await globalRateLimiter.waitIfNeeded("alpha-vantage-search");
        
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`;
        
        const searchResponse = await axios.get(searchUrl, {
          timeout: 10000,
          headers: {
            "User-Agent": "ETF-Research-Tool/1.0",
          },
        });

        if (searchResponse.data.bestMatches) {
          const searchData: AlphaVantageSearchResponse = searchResponse.data;
          
          // Filter for ETFs and add to symbols to check
          searchData.bestMatches
            .filter(match => match["3. type"] === "ETF" || match["1. symbol"].includes("ETF"))
            .slice(0, 10) // Limit to top 10 results
            .forEach(match => {
              symbolsToCheck.push(match["1. symbol"]);
            });
        }
      } catch (error) {
        console.log("Search failed, using default ETF list");
      }
    }

    // Add popular dividend ETFs if search didn't yield enough results
    const popularDividendETFs = [
      "VYM", "SCHD", "HDV", "DGRO", "NOBL", "VIG", "DVY", 
      "SPHD", "SPYD", "VTI", "VXUS", "IEMG", "VEA", "VWO", 
      "VTEB", "VGIT", "VCIT", "VNQ", "VNQI", "XLF"
    ];

    // Add popular ETFs if we don't have enough symbols from search
    if (symbolsToCheck.length < 5) {
      popularDividendETFs.forEach(symbol => {
        if (!symbolsToCheck.includes(symbol)) {
          symbolsToCheck.push(symbol);
        }
      });
    }

    // Limit to 8 symbols to avoid rate limits while getting good coverage
    const symbolsToProcess = symbolsToCheck.slice(0, 8);

    // Get detailed information for each ETF
    for (const symbol of symbolsToProcess) {
      try {
        // Rate limit individual requests
        await globalRateLimiter.waitIfNeeded("alpha-vantage-detail");

        // Get company overview which includes dividend yield
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

        const overviewResponse = await axios.get(overviewUrl, {
          timeout: 10000,
          headers: {
            "User-Agent": "ETF-Research-Tool/1.0",
          },
        });

        if (overviewResponse.data.Note) {
          console.log("Alpha Vantage rate limit reached");
          break;
        }

        if (overviewResponse.data["Error Message"]) {
          continue;
        }

        const overview: AlphaVantageOverview = overviewResponse.data;

        if (overview.Symbol && overview.Name) {
          // Get real-time quote data for more accurate pricing
          let currentPrice: number | undefined;
          let priceChange: number | undefined;
          
          try {
            await globalRateLimiter.waitIfNeeded("alpha-vantage-quote");
            
            const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
            
            const quoteResponse = await axios.get(quoteUrl, {
              timeout: 8000,
              headers: {
                "User-Agent": "ETF-Research-Tool/1.0",
              },
            });

            if (quoteResponse.data["Global Quote"]) {
              const quote: AlphaVantageQuote = quoteResponse.data;
              currentPrice = parseFloat(quote["Global Quote"]["05. price"] || "0");
              priceChange = parseFloat(quote["Global Quote"]["09. change"] || "0");
            }
          } catch (error) {
            // Use overview data as fallback
          }

          const dividendYield = parseFloat(overview.DividendYield || "0");
          const price = currentPrice || parseFloat(overview["50DayMovingAverage"] || overview["200DayMovingAverage"] || "0");
          const marketCap = parseFloat(overview.MarketCapitalization || "0");
          const dividendPerShare = parseFloat(overview.DividendPerShare || "0");

          // Only include ETFs with valid dividend yield data
          const finalDividendYield = dividendYield > 0 ? dividendYield * 100 : 0;
          
          if (finalDividendYield > 0) {
            results.push({
              symbol: overview.Symbol,
              name: overview.Name,
              dividendYield: finalDividendYield,
              sector: overview.Sector || "Unknown",
              price: price > 0 ? price : undefined,
              marketCap: marketCap > 0 ? marketCap : undefined,
              description: overview.Description || `${overview.Name} is a diversified ETF`,
              source: "Alpha Vantage",
              timestamp: new Date().toISOString(),
              region: overview.Country || "USA",
              expenseRatio: undefined, // Not available in Alpha Vantage
              aum: marketCap > 0 ? marketCap : undefined, // Use market cap as AUM approximation
              inceptionDate: undefined, // Not available in Alpha Vantage
            });
          }
        }

        // Reduced delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1200)); // 1.2 second delay
      } catch (error) {
        console.log(`Error processing ${symbol}:`, error);
        // Skip this symbol and continue
      }
    }

    return results;
  } catch (error) {
    console.error("Error in Alpha Vantage data fetching:", error);
    return [];
  }
};

export default getAlphaVantageData;
