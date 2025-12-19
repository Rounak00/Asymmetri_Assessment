import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { weatherTool, stockTool, f1Tool } from "@/ai-tools";
import { db } from "@/db";
import { messages as messagesTable } from "@/db/schema";


export const maxDuration = 30; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  // Get messages and chatId from the frontend
  const { messages, chatId } = await req.json();

  //Get the last message - The one the user just sent
  const lastUserMessage = messages[messages.length - 1];

  //save user message to DB immediately
  if (chatId && lastUserMessage) {
    await db.insert(messagesTable).values({
      chatId,
      role: "user",
      content: lastUserMessage.content,
    });
  }

  //start the AI Stream
  const result = await streamText({
    model: google("gemini-1.5-flash"),
    messages: messages as any,
    tools: {
      getWeather: weatherTool,
      getStockPrice: stockTool,
      getF1Matches: f1Tool,
    },
    maxSteps: 5,
    
    //save AI Response
    onFinish: async ({ text }: { text: string }) => {
      if (chatId && text) { // Only save if there is text (sometimes it return empty text first)
        await db.insert(messagesTable).values({
          chatId,
          role: "assistant",
          content: text,
        });
      }
    },
  } as any);

   // FIX: Cast to 'any' to fix the TypeScript error. 
  // 'toDataStreamResponse' exists in v5 and is required for tools to work.
  return (result as any).toDataStreamResponse();
}