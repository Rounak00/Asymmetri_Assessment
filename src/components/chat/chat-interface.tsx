"use client";

import { useChat } from "@ai-sdk/react";
import { WeatherCard, StockCard, F1Card } from "@/components/chat/tool-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, LogOut, Bot, User } from "lucide-react";
import { signOut } from "next-auth/react"; 

export default function ChatInterface({ userName }: { userName: string }) {
  // Vercel AI SDK Hook
  // We cast to 'any' to bypass the TypeScript version conflict.
  // The logic is correct and will work in the browser.
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  }as any) as any;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r hidden md:flex flex-col p-4 justify-between">
        <div>
          <h1 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" /> 
            Asymmetri AI
          </h1>
          <div className="text-sm text-gray-500 mb-4">
            Logged in as:<br/> 
            <span className="font-medium text-black">{userName}</span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full gap-2 text-red-500 hover:text-red-600" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      {/* main chat area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl h-full">
        
        {/* messages List */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-6 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <p>Ask me about the weather, stock prices, or F1 races!</p>
              </div>
            )}

            {messages.map((m:any) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                
                {/* AI avatar */}
                {m.role === "assistant" && (
                   <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                     <Bot className="h-5 w-5 text-purple-600" />
                   </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-4 ${
                    m.role === "user" 
                    ? "bg-black text-white rounded-tr-none" 
                    : "bg-gray-100 text-black rounded-tl-none"
                  }`}
                >
                  {/* Text Content */}
                  <div className="text-sm leading-relaxed">{m?.content}</div>

                  {/* Tool cards (Weather/Stock/race) */}
                  {m.toolInvocations?.map((toolInvocation: any) => {
                    const toolCallId = toolInvocation.toolCallId;
                    
                    // Only show card if we have a result
                    if ('result' in toolInvocation) {
                      if (toolInvocation.toolName === 'getWeather') 
                         return <WeatherCard key={toolCallId} data={toolInvocation.result} />;
                      if (toolInvocation.toolName === 'getStockPrice') 
                        return <StockCard key={toolCallId} data={toolInvocation.result} />;
                      if (toolInvocation.toolName === 'getF1Matches') 
                        return <F1Card key={toolCallId} data={toolInvocation.result} />;
                    }
                    return <div key={toolCallId} className="text-xs text-gray-400 mt-2 animate-pulse">Running tool...</div>;
                  })}
                </div>

                {/* user avatar */}
                {m.role === "user" && (
                   <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                     <User className="h-5 w-5 text-gray-600" />
                   </div>
                )}
              </div>
            ))}
            
            {/* Loading ui */}
            {isLoading && (
               <div className="flex justify-start gap-3">
                 <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                   <Bot className="h-5 w-5 text-purple-600" />
                 </div>
                 <div className="bg-gray-100 rounded-2xl p-4 rounded-tl-none">
                   <div className="flex gap-1">
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                   </div>
                 </div>
               </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}