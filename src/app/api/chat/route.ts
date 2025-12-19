// import { google } from "@ai-sdk/google";
// import { streamText } from "ai";
// import { weatherTool, stockTool, f1Tool } from "@/ai-tools";
// import { db } from "@/db";
// import { messages as messagesTable, chats } from "@/db/schema";
// import { auth } from "@/config/authHandler";
// import { eq, and } from "drizzle-orm";

// export const maxDuration = 30;

// export async function POST(req: Request) {
//   try {
//     // Authenticate the request
//     const session = await auth();
//     if (!session?.user?.id) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     // Get messages and chatId from the frontend
//     const { messages, chatId } = await req.json();

//     if (!chatId) {
//       return new Response("Chat ID is required", { status: 400 });
//     }

//     // Verify the chat belongs to this user
//     const chat = await db
//       .select()
//       .from(chats)
//       .where(
//         and(
//           eq(chats.id, chatId),
//           eq(chats.userId, session.user.id)
//         )
//       )
//       .limit(1);

//     if (chat.length === 0) {
//       return new Response("Chat not found", { status: 404 });
//     }

//     // Get the last message - The one the user just sent
//     const lastUserMessage = messages[messages.length - 1];

//     // Save user message to DB immediately
//     if (lastUserMessage && lastUserMessage.role === "user") {
//       await db.insert(messagesTable).values({
//         chatId,
//         role: "user",
//         content: lastUserMessage.content,
//       });
//     }

//     // Start the AI Stream
//     const result = streamText({
//       model: google("gemini-1.5-flash"),
//       messages: messages,
//       tools: {
//         getWeather: weatherTool,
//         getStockPrice: stockTool,
//         getF1Matches: f1Tool,
//       },
//       maxSteps: 5,
//       onFinish: async ({ text }) => {
//         // Save AI Response - only if there's actual text content
//         if (text && text.trim()) {
//           try {
//             await db.insert(messagesTable).values({
//               chatId,
//               role: "assistant",
//               content: text,
//             });
//           } catch (error) {
//             console.error("Error saving assistant message:", error);
//           }
//         }
//       },
//     });

//     return result.toTextStreamResponse();
//   } catch (error) {
//     console.error("Chat API error:", error);
//     return new Response(
//       JSON.stringify({ error: "Internal server error" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
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
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Authenticate the request
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get messages and chatId from the frontend
    const body = await req.json();
    const { messages, chatId } = body;

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Chat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify the chat belongs to this user
    const chat = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
      .limit(1);

    if (chat.length === 0) {
      return new Response(JSON.stringify({ error: "Chat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
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
      model: google("gemini-1.5-flash"),
      messages: messages,
      tools: {
        getWeather: weatherTool,
        getStockPrice: stockTool,
        getF1Matches: f1Tool,
      },
      maxSteps: 5,
      onFinish: async ({ text }) => {
        // Save AI Response
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
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Add GET handler to test if route is accessible
export async function GET() {
  return new Response(JSON.stringify({ status: "Chat API is working" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}