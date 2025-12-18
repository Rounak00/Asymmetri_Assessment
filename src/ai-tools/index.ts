import { z } from "zod";
import { tool } from "ai";

//weather tool
export const weatherTool = tool({
  description: "Get the current weather for a specific location",
  parameters: z.object({
    location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  }),
  execute: async ({ location }: { location: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      location,
      temperature: 72,
      condition: "Sunny",
      humidity: 45,
    };
  },
}as any);

//Stock Tool
export const stockTool = tool({
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
}as any);

//F1 race tool
export const f1Tool = tool({
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
}as any);