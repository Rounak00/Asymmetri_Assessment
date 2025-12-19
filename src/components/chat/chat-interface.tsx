// "use client";

// import { useChat } from "@ai-sdk/react";
// import { useState } from "react";
// import { WeatherCard, StockCard, F1Card } from "@/components/chat/tool-cards";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Send,
//   LogOut,
//   Bot,
//   User,
//   Plus,
//   MessageSquare,
//   Loader2,
// } from "lucide-react";
// import { signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { ChatInterfaceProps, CMessage, ToolInvocation } from "@/types";

// export default function ChatInterface({
//   userName,
//   initialChatId,
//   history,
//   initialMessages = [],
// }: ChatInterfaceProps) {
//   const router = useRouter();
//   const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

//   // Get raw messages from SDK
//   const {
//     messages: rawMessages,
//     input,
//     handleInputChange,
//     handleSubmit,
//     isLoading,
//   } = useChat({
//     api: "/api/chat",
//     body: {
//       chatId: initialChatId,
//     },
//     initialMessages: initialMessages as any,
//     onFinish: () => {
//       router.refresh();
//     },
//   });

//   // FORCE TYPE: Cast SDK messages to our CMessage type
//   // as "Property 'content' does not exist" and "toolInvocations missing"
//   const messages = rawMessages as unknown as CMessage[];

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r hidden md:flex flex-col p-4 justify-between">
//         <div>
//           <h1 className="font-bold text-xl mb-6 flex items-center gap-2">
//             <Bot className="h-6 w-6 text-purple-600" />
//             Asymmetri AI
//           </h1>

//           <Button
//             variant="outline"
//             className="w-full mb-4 justify-start gap-2 border-dashed"
//             onClick={() => (window.location.href = "/")}
//           >
//             <Plus className="h-4 w-4" /> New Chat
//           </Button>

//           <div className="space-y-1">
//             <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
//               Recent Chats
//             </p>
//             <ScrollArea className="h-[300px]">
//               {history?.length === 0 && (
//                 <p className="text-xs text-gray-400 italic">No history yet</p>
//               )}

//               {history?.map((chat) => (
//                 <Button
//                   key={chat.id}
//                   variant={chat.id === initialChatId ? "secondary" : "ghost"}
//                   className="w-full justify-start text-sm truncate px-2"
//                   onClick={() => router.push(`/?id=${chat.id}`)}
//                 >
//                   <MessageSquare className="h-4 w-4 mr-2 opacity-70" />
//                   <span className="truncate w-full text-left">
//                     {chat.title}
//                   </span>
//                 </Button>
//               ))}
//             </ScrollArea>
//           </div>
//         </div>

//         <div className="border-t pt-4">
//           <div className="text-sm text-gray-500 mb-2 truncate">
//             User: {userName}
//           </div>
//           <Button
//             variant="destructive"
//             size="sm"
//             className="w-full gap-2"
//             disabled={isSigningOut}
//             onClick={async () => {
//               setIsSigningOut(true);
//               await signOut();
//             }}
//           >
//             {isSigningOut ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <LogOut className="h-4 w-4" />
//             )}
//             Sign Out
//           </Button>
//         </div>
//       </div>

//       {/*main chat area */}
//       <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl h-full">
//         <ScrollArea className="flex-1 p-4">
//           <div className="flex flex-col gap-6 pb-4">
//             {messages.length === 0 && (
//               <div className="text-center text-gray-400 mt-20">
//                 <p>Ask me about the weather, stock prices, or F1 races!</p>
//               </div>
//             )}

//             {messages.map((m) => (
//               <div
//                 key={m.id}
//                 className={`flex gap-3 ${
//                   m.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 {m.role === "assistant" && (
//                   <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
//                     <Bot className="h-5 w-5 text-purple-600" />
//                   </div>
//                 )}

//                 <div
//                   className={`max-w-[80%] rounded-2xl p-4 ${
//                     m.role === "user"
//                       ? "bg-black text-white rounded-tr-none"
//                       : "bg-gray-100 text-black rounded-tl-none"
//                   }`}
//                 >
//                   <div className="text-sm leading-relaxed whitespace-pre-wrap">
//                     {m.content}
//                   </div>

//                   {/*Tool cards */}
//                   {m.toolInvocations?.map((invocation: any) => {
//                     const toolInvocation = invocation as ToolInvocation; // Safe Cast to our Interface
//                     const toolCallId = toolInvocation.toolCallId;

//                     if ("result" in toolInvocation) {
//                       if (toolInvocation.toolName === "getWeather")
//                         return (
//                           <WeatherCard
//                             key={toolCallId}
//                             data={toolInvocation.result}
//                           />
//                         );
//                       if (toolInvocation.toolName === "getStockPrice")
//                         return (
//                           <StockCard
//                             key={toolCallId}
//                             data={toolInvocation.result}
//                           />
//                         );
//                       if (toolInvocation.toolName === "getF1Matches")
//                         return (
//                           <F1Card
//                             key={toolCallId}
//                             data={toolInvocation.result}
//                           />
//                         );
//                     }
//                     return (
//                       <div
//                         key={toolCallId}
//                         className="text-xs text-gray-400 mt-2 animate-pulse"
//                       >
//                         Running tool...
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {m.role === "user" && (
//                   <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
//                     <User className="h-5 w-5 text-gray-600" />
//                   </div>
//                 )}
//               </div>
//             ))}

//             {isLoading && (
//               <div className="text-sm text-gray-400 p-4 animate-pulse">
//                 AI is typing...
//               </div>
//             )}
//           </div>
//         </ScrollArea>

//         <div className="p-4 border-t bg-white">
//           <form onSubmit={handleSubmit} className="flex gap-3">
//             <Input
//               value={input}
//               onChange={handleInputChange}
//               placeholder="Type your message..."
//               className="flex-1"
//             />
//             <Button type="submit" disabled={isLoading} size="icon">
//               <Send className="h-4 w-4" />
//             </Button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { WeatherCard, StockCard, F1Card } from "@/components/chat/tool-cards";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  LogOut,
  Bot,
  User,
  Plus,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChatInterfaceProps, CMessage, ToolInvocation } from "@/types";
import { updateChatTitle } from "@/app/actions";

export default function ChatInterface({
  key,
  userName,
  initialChatId,
  history,
  initialMessages = [],
}: ChatInterfaceProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [hasUpdatedTitle, setHasUpdatedTitle] = useState(
    initialMessages.length > 0
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<CMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Update chat title after first user message
  useEffect(() => {
    const updateTitle = async () => {
      if (!hasUpdatedTitle && messages.length > 0) {
        const firstUserMessage = messages.find((m) => m.role === "user");
        if (firstUserMessage && firstUserMessage.content) {
          const title =
            firstUserMessage.content.slice(0, 50) +
            (firstUserMessage.content.length > 50 ? "..." : "");
          await updateChatTitle(initialChatId, title);
          setHasUpdatedTitle(true);
          router.refresh();
        }
      }
    };
    updateTitle();
  }, [messages, hasUpdatedTitle, initialChatId, router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Submit handler - manually calls the API
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    // Create user message
    const userMessage: CMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // Call the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          chatId: initialChatId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      // Create assistant message placeholder
      const assistantMessage: CMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        toolInvocations: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let fullContent = "";
      let currentToolInvocations: ToolInvocation[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          // Parse the streaming data format
          if (line.startsWith("0:")) {
            // Text content
            try {
              const text = JSON.parse(line.slice(2));
              fullContent += text;
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = fullContent;
                }
                return updated;
              });
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          } else if (line.startsWith("9:")) {
            // Tool call
            try {
              const toolData = JSON.parse(line.slice(2));
              if (toolData.toolCallId) {
                const toolInvocation: ToolInvocation = {
                  toolCallId: toolData.toolCallId,
                  toolName: toolData.toolName,
                  args: toolData.args || {},
                  state: "pending",
                };
                currentToolInvocations = [...currentToolInvocations, toolInvocation];
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === "assistant") {
                    lastMsg.toolInvocations = currentToolInvocations;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          } else if (line.startsWith("a:")) {
            // Tool result
            try {
              const resultData = JSON.parse(line.slice(2));
              if (resultData.toolCallId) {
                currentToolInvocations = currentToolInvocations.map((t) =>
                  t.toolCallId === resultData.toolCallId
                    ? { ...t, result: resultData.result, state: "result" as const }
                    : t
                );
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === "assistant") {
                    lastMsg.toolInvocations = currentToolInvocations;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      router.refresh();
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push("/");
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/?id=${chatId}`);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r hidden md:flex flex-col p-4 justify-between">
        <div>
          <h1 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" /> Asymmetri AI
          </h1>

          <Button
            variant="outline"
            className="w-full mb-4 justify-start gap-2 border-dashed"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" /> New Chat
          </Button>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Recent Chats
            </p>
            <ScrollArea className="h-[300px]">
              {history?.length === 0 && (
                <p className="text-xs text-gray-400 italic">No history yet</p>
              )}

              {history?.map((chat) => (
                <Button
                  key={chat.id}
                  variant={chat.id === initialChatId ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm truncate px-2 mb-1"
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2 opacity-70 flex-shrink-0" />
                  <span className="truncate w-full text-left">
                    {chat.title}
                  </span>
                </Button>
              ))}
            </ScrollArea>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-gray-500 mb-2 truncate">
            User: {userName}
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            disabled={isSigningOut}
            onClick={async () => {
              setIsSigningOut(true);
              await signOut();
            }}
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl h-full">
        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-200">
            Error: {error.message}
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-6 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <Bot className="h-12 w-12 mx-auto mb-4 text-purple-300" />
                <p className="text-lg font-medium">Welcome to Asymmetri AI!</p>
                <p className="mt-2">
                  Ask me about the weather, stock prices, or F1 races!
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    What is the weather in London?
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Get AAPL stock price
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    When is the next F1 race?
                  </span>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 flex-shrink-0">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    m.role === "user"
                      ? "bg-black text-white rounded-tr-none"
                      : "bg-gray-100 text-black rounded-tl-none"
                  }`}
                >
                  {m.content && (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  )}

                  {/* Tool cards */}
                  {m.toolInvocations?.map((invocation) => {
                    const toolCallId = invocation.toolCallId;

                    if (invocation.result) {
                      if (invocation.toolName === "getWeather")
                        return (
                          <WeatherCard
                            key={toolCallId}
                            data={invocation.result}
                          />
                        );
                      if (invocation.toolName === "getStockPrice")
                        return (
                          <StockCard
                            key={toolCallId}
                            data={invocation.result}
                          />
                        );
                      if (invocation.toolName === "getF1Matches")
                        return (
                          <F1Card
                            key={toolCallId}
                            data={invocation.result}
                          />
                        );
                    }
                    return (
                      <div
                        key={toolCallId}
                        className="text-xs text-gray-400 mt-2 flex items-center gap-2"
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Running {invocation.toolName}...
                      </div>
                    );
                  })}
                </div>

                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is thinking...
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white">
          <form onSubmit={onSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}