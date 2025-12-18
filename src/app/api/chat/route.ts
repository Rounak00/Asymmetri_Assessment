import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";
import { weatherTool, stockTool, f1Tool } from "@/ai-tools";
import { db } from "@/db";
import { messages as messagesTable } from "@/db/schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  //Get messages AND chatId from the frontend
  const { messages, chatId } = await req.json();

  // Get the last message (The one the user just sent)
  const lastUserMessage = messages[messages.length - 1];

  //Save User Message to DB immediately
  // We only save if we have a valid chatId
  if (chatId && lastUserMessage) {
    await db.insert(messagesTable).values({
      chatId,
      role: "user",
      content: lastUserMessage.content,
    });
  }

  //Start the AI Stream
  const result = await streamText({
    model: google("gemini-1.5-flash"),
    messages: convertToCoreMessages(messages),
    tools: {
      getWeather: weatherTool,
      getStockPrice: stockTool,
      getF1Matches: f1Tool,
    },
    maxSteps: 5,
    
    //LIFECYCLE HOOK: This runs when the AI finishes generating
    onFinish: async ({ text }) => {
      if (chatId && text) {
        await db.insert(messagesTable).values({
          chatId,
          role: "assistant",
          content: text,
        });
      }
    },
  });

//   return result.toDataStreamResponse();
return result.toTextStreamResponse();
}