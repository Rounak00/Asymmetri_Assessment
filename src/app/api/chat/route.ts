import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";
import { weatherTool, stockTool, f1Tool } from "@/ai-tools";

// Allowing streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  //Initialize the Stream with Tools
  const result = await streamText({
    model: google("gemini-1.5-flash"),
    messages: convertToCoreMessages(messages),
    // Register the tools
    tools: {
      getWeather: weatherTool,
      getStockPrice: stockTool,
      getF1Matches: f1Tool,
    },
    // A high level overview is like this :    Call Tool -> Get Result -> Read Result -> Send Final Answer
    maxSteps: 5,
  });
  return result.toDataStreamResponse();
}