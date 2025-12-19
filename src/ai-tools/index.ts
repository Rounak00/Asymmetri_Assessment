import { z } from "zod";
import { tool } from "ai";

//weather tool
export const weatherTool = tool({
  description: "Get the current weather for a specific location",
  parameters: z.object({
    location: z.string().describe("The city name, e.g. London, New York"),
  }),
  execute: async ({ location }: { location: string }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return { error: "Missing API Key" };

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`
      );
      if (!response.ok) return { error: "Location not found" };
      
      const data = await response.json();
      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
      };
    } catch (e) {
      return { error: "API Error" };
    }
  },
} as any);

// stock tool
export const stockTool = tool({
  description: "Get the current stock price for a symbol",
  parameters: z.object({
    symbol: z.string().describe("The stock symbol, e.g. AAPL, MSFT"),
  }),
  execute: async ({ symbol }: { symbol: string }) => {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;
    if (!apiKey) return { error: "Missing API Key" };

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();
      const quote = data["Global Quote"];

      if (!quote || !quote["05. price"]) return { error: "Symbol not found or Rate Limit" };

      return {
        symbol: quote["01. symbol"],
        price: parseFloat(quote["05. price"]).toFixed(2),
        change: quote["10. change percent"],
      };
    } catch (e) {
      return { error: "API Error" };
    }
  },
} as any);

//F1 Tool
export const f1Tool = tool({
  description: "Get the next upcoming Formula 1 race",
  parameters: z.object({}), 
  execute: async () => {
    try {
      //Ergast API is not working so using jolpi
      const response = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json");
      if (!response.ok) return { error: "No race data found" };

      const data = await response.json();
      const raceData = data.MRData.RaceTable.Races[0];
      return {
        raceName: raceData.raceName,
        circuit: raceData.Circuit.circuitName,
        date: raceData.date,
        time: raceData.time ? raceData.time.slice(0, 5) + " UTC" : "TBA",
      };
    } catch (e) {
      return { error: "API Error" };
    }
  },
} as any);