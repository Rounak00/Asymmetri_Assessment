import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";
import { weatherTool, stockTool, f1Tool } from "@/ai-tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    messages: convertToCoreMessages(messages),
    tools: {
      getWeather: weatherTool,
      getStockPrice: stockTool,
      getF1Matches: f1Tool,
    },
    maxSteps: 5,
  });

//   return result.toDataStreamResponse();
return result.toTextStreamResponse();
}