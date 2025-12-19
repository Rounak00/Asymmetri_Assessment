// import { google } from "@ai-sdk/google";
// import { streamText } from "ai"; // REMOVED convertToCoreMessages
// import { weatherTool, stockTool, f1Tool } from "@/ai-tools";
// import { db } from "@/db";
// import { messages as messagesTable } from "@/db/schema";

// export const maxDuration = 30;

// export async function POST(req: Request) {
//   try {
//     const { messages, chatId } = await req.json();

//     // Save User Message to DB
//     const lastUserMessage = messages[messages.length - 1];
//     if (chatId && lastUserMessage) {
//       try {
//         await db.insert(messagesTable).values({
//           chatId,
//           role: "user",
//           content: lastUserMessage.content,
//         });
//         console.log("User message saved to DB");
//       } catch (dbError) {
//         console.error("Failed to save user message:", dbError);
//       }
//     }

//     //format nessages manually (Fixes Deprecation Warning) as "convertToCoreMessages" shows depricated 
//     // strip out extra UI properties to prevent google api errors
//     const coreMessages = messages.map((m: any) => ({
//       role: m.role,
//       content: m.content,
//     }));

//     // start AI Stream
//     const result = await streamText({
//       model: google("gemini-1.5-flash"),
//       messages: coreMessages,
//       tools: {
//         getWeather: weatherTool,
//         getStockPrice: stockTool,
//         getF1Matches: f1Tool,
//       },
//       maxSteps: 5,
      
//       // sva ethe ai response
//       onFinish: async ({ text }: { text: string }) => {
//         if (chatId && text) { // We only save if there is actual text content
//           try {
//             await db.insert(messagesTable).values({
//               chatId,
//               role: "assistant",
//               content: text,
//             });
//             console.log("✅ AI response saved to DB");
//           } catch (dbError) {
//             console.error("Failed to save AI response:", dbError);
//           }
//         }
//       },
//     } as any);

//     return (result as any).toDataStreamResponse();

//   } catch (error) {
//     console.error("API ROUTE CRITICAL ERROR:", error);
//     return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
//   }
// }

import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { weatherTool, stockTool, f1Tool } from "@/ai-tools";
import { db } from "@/db";
import { messages as messagesTable, chats } from "@/db/schema";
import { auth } from "@/config/authHandler";
import { eq, and } from "drizzle-orm";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Authenticate the request
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get messages and chatId from the frontend
    const { messages, chatId } = await req.json();

    if (!chatId) {
      return new Response("Chat ID is required", { status: 400 });
    }

    // Verify the chat belongs to this user
    const chat = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, session.user.id)
        )
      )
      .limit(1);

    if (chat.length === 0) {
      return new Response("Chat not found", { status: 404 });
    }

    // Get the last message - The one the user just sent
    const lastUserMessage = messages[messages.length - 1];

    // Save user message to DB immediately
    if (lastUserMessage && lastUserMessage.role === "user") {
      await db.insert(messagesTable).values({
        chatId,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    // Start the AI Stream
    const result = streamText({
      model: google("gemini-1.5-pro"),
      messages: messages,
      tools: {
        getWeather: weatherTool,
        getStockPrice: stockTool,
        getF1Matches: f1Tool,
      },
      maxSteps: 5,
      onFinish: async ({ text }) => {
        // Save AI Response - only if there's actual text content
        if (text && text.trim()) {
          try {
            await db.insert(messagesTable).values({
              chatId,
              role: "assistant",
              content: text,
            });
          } catch (error) {
            console.error("Error saving assistant message:", error);
          }
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}