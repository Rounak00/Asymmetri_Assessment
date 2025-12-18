import { z } from "zod";

// Weather Tool
export const weatherTool = {
  description: "Get the current weather for a specific location",
  parameters: z.object({
    location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  }),
  execute: async ({ location }: { location: string }) => {
    // Mock Data for the assessment (Real API calls can go here)
    // We simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      location,
      temperature: 72,
      condition: "Sunny",
      humidity: 45,
    };
  },
};

// Stock Pricings
export const stockTool = {
  description: "Get the current stock price for a symbol",
  parameters: z.object({
    symbol: z.string().describe("The stock symbol, e.g. AAPL, GOOGL"),
  }),
  execute: async ({ symbol }: { symbol: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      symbol: symbol.toUpperCase(),
      price: 150.25,
      change: "+1.2%",
    };
  },
};

// F1 Matches
export const f1Tool = {
  description: "Get the next upcoming Formula 1 race",
  parameters: z.object({}),
  execute: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      raceName: "Monaco Grand Prix",
      circuit: "Circuit de Monaco",
      date: "2024-05-26",
      time: "14:00 GMT",
    };
  },
};