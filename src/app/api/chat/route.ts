// import { createGroq } from "@ai-sdk/groq";
// import { streamText } from "ai";
// import { weatherTool, stockTool, f1Tool } from "@/ai-tools";
// import { db } from "@/db";
// import { messages as messagesTable, chats } from "@/db/schema";
// import { auth } from "@/config/authHandler";
// import { eq, and } from "drizzle-orm";

// // Initialize Groq Provider
// const groq = createGroq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export const maxDuration = 30;
// export const dynamic = "force-dynamic";

// export async function POST(req: Request) {
//   try {
//     // 1. Authenticate
//     const session = await auth();
//     if (!session?.user?.id) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // 2. Parse Body
//     const body = await req.json();
//     const { messages, chatId } = body;

//     if (!chatId) {
//       return new Response(JSON.stringify({ error: "Chat ID is required" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // 3. Verify Chat Ownership
//     const chat = await db
//       .select()
//       .from(chats)
//       .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
//       .limit(1);

//     if (chat.length === 0) {
//       return new Response(JSON.stringify({ error: "Chat not found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // 4. Save User Message
//     // This saves exactly what the user typed into the 'content' field
//     const lastUserMessage = messages[messages.length - 1];
//     if (lastUserMessage && lastUserMessage.role === "user") {
//       await db.insert(messagesTable).values({
//         chatId,
//         role: "user",
//         content: lastUserMessage.content,
//       });
//     }

//     // 5. Start AI Stream
//     const result = streamText({
//       model: groq("llama-3.3-70b-versatile"),
//       messages: messages,
//       tools: {
//         getWeather: weatherTool,
//         getStockPrice: stockTool,
//         getF1Matches: f1Tool,
//       },
//       maxSteps: 5, // Allow the AI to run the tool, get results, and then speak
      
//       // 6. Save AI Response
//       onFinish: async ({ text, toolCalls, toolResults }) => {
//         const hasContent = text && text.trim().length > 0;
//         const hasTools = toolCalls && toolCalls.length > 0;

//         // Only save if the AI actually did something (spoke or used a tool)
//         if (hasContent || hasTools) {
//           try {
//             // MERGE Logic: 
//             // We find the result matching the toolCallId and combine them.
//             // This ensures the DB has the 'result' data needed for the UI cards.
//             const invocationsWithResults = hasTools
//               ? toolCalls.map((call) => {
//                   const result = toolResults?.find(
//                     (r) => r.toolCallId === call.toolCallId
//                   );
//                   return {
//                     toolCallId: call.toolCallId,
//                     toolName: call.toolName,
//                     args: call.args,
//                     result: result?.result, // <--- This saves the weather data!
//                   };
//                 })
//               : null;

//             await db.insert(messagesTable).values({
//               chatId,
//               role: "assistant",
//               // Saves the AI's spoken text exactly as is
//               content: text || "", 
//               // Saves the tool data as JSONB
//               toolInvocations: invocationsWithResults, 
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
//       JSON.stringify({ error: "Internal server error", details: String(error) }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

// export async function GET() {
//   return new Response(JSON.stringify({ status: "Groq Chat API is working" }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }

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

    // Save user message
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

      // ✅ LOGIC: Use 'steps' to capture tool execution history
      onFinish: async ({ text, steps }) => {
        console.log("🔥 onFinish Executing...");
        
        let finalToolInvocations: any[] | null = null;

        // Extract tool results from ALL steps
        if (steps && steps.length > 0) {
          const allInvocations: any[] = [];

          for (const step of steps) {
            // We specifically look for toolResults
            if (step.toolResults && step.toolResults.length > 0) {
              for (const toolResult of step.toolResults) {
                allInvocations.push({
                  toolCallId: toolResult.toolCallId,
                  toolName: toolResult.toolName,
                  args: toolResult.args,
                  result: toolResult.result, 
                });
                console.log(`✅ Captured Tool: ${toolResult.toolName}`);
              }
            }
          }

          if (allInvocations.length > 0) {
            finalToolInvocations = allInvocations;
          }
        }

        // Save to database
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
            console.log("✅ Database Insert Success");
          } catch (err) {
            console.error("❌ Database Insert Failed:", err);
          }
        }
      },
    });

    // after 'npm install ai@latest', this function will definitely exist
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "OK" }));
}