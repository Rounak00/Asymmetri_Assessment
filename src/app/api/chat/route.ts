import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { weatherTool, stockTool, f1Tool } from "@/ai-tools";
import { db } from "@/db";
import { messages as messagesTable, chats } from "@/db/schema";
import { auth } from "@/config/authHandler";
import { eq, and } from "drizzle-orm";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { messages, chatId } = await req.json();

    if (!chatId) return new Response("Chat ID required", { status: 400 });

    const chat = await db.select().from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
      .limit(1);

    if (chat.length === 0) return new Response("Chat not found", { status: 404 });

    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      await db.insert(messagesTable).values({
        chatId,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: messages,
      tools: {
        getWeather: weatherTool,
        getStockPrice: stockTool,
        getF1Matches: f1Tool,
      },
      maxSteps: 5,

      onFinish: async ({ text, steps }) => {
        let finalToolInvocations: any[] | null = null;

        if (steps && steps.length > 0) {
          const allTools = [];

          //register  aLL tools
          for (const step of steps) {
            if (step.toolResults) {
              for (const toolResult of step.toolResults) {
                 allTools.push({
                  toolCallId: toolResult.toolCallId,
                  toolName: toolResult.toolName,
                  args: toolResult.args,
                  result: toolResult.result, 
                });
              }
            }
          }

          // aggressievly filtering - We remove any card that looks like a failure so it never hits the DB
          finalToolInvocations = allTools.filter((item) => {
             const res = item.result;
             if (!res) return false;

             // DELETE "Unknown Location" weather cards or cards that  are invalid data get from api
             if (item?.toolName === 'getWeather' && 'condition' in res && res.condition === 'Unknown Location') {
                return false; 
             }
             if (item?.toolName === 'getStockPrice' && 'price' in res && (res.price === 0 || res.price === "0")) {
                return false;
             }
             if (item?.toolName === 'getF1Matches' && 'raceName' in res && res.raceName === 'Unknown Race') {
                return false;
             }

             return true;
          });
        }

        const hasContent = text && text.trim().length > 0;
        const hasTools = finalToolInvocations && finalToolInvocations.length > 0;

        if (hasContent || hasTools) {
          try {
            await db.insert(messagesTable).values({
              chatId,
              role: "assistant",
              content: text || "",
              toolInvocations: finalToolInvocations,
            });
          } catch (err) {
            console.error("Database Insert Failed:", err);
          }
        }
      },
    });

    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}