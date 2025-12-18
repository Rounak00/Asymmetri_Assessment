"use client";

import { useChat } from "@ai-sdk/react";
import { WeatherCard, StockCard, F1Card } from "@/components/chat/tool-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, LogOut, Bot, User, Plus, MessageSquare } from "lucide-react";
import { signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import { ChatInterfaceProps } from "@/types";

export default function ChatInterface({ 
  userName, 
  initialChatId, 
  history,
  initialMessages = []
}: ChatInterfaceProps) {
  const router = useRouter();

  // Vercel AI SDK Hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      chatId: initialChatId
    },
    initialMessages: initialMessages, // Load existing messages if we are opening an old chat
   
    onFinish: () => {  // When the first message finishes, refresh to update the sidebar title
      router.refresh(); 
    }
  }) as any;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* sidebar */}
      <div className="w-64 bg-white border-r hidden md:flex flex-col p-4 justify-between">
        <div>
          <h1 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" /> 
            Asymmetri AI
          </h1>
          
          {/* new chat button */}
          <Button 
            variant="outline" 
            className="w-full mb-4 justify-start gap-2 border-dashed"
            onClick={() => window.location.href = "/"}
          >
            <Plus className="h-4 w-4" /> New Chat
          </Button>

          {/*history side bar */}
          <div className="space-y-1">
             <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Recent Chats</p>
             <ScrollArea className="h-[300px]">
               {history?.length === 0 && <p className="text-xs text-gray-400 italic">No history yet</p>}
               
               {history?.map((chat) => (
                 <Button 
                   key={chat.id} 
                   variant={chat.id === initialChatId ? "secondary" : "ghost"}
                   className="w-full justify-start text-sm truncate px-2"
                   onClick={() => router.push(`/?id=${chat.id}`)} 
                 >
                   <MessageSquare className="h-4 w-4 mr-2 opacity-70" />
                   <span className="truncate w-full text-left">{chat.title}</span>
                 </Button>
               ))}
             </ScrollArea>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm text-gray-500 mb-2 truncate">User: {userName}</div>
          <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/*main chat area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl h-full">
        
        {/* Messages list */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-6 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <p>Ask me about the weather, stock prices, or F1 races!</p>
              </div>
            )}

            {messages.map((m: any) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                
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
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>

                  {m.toolInvocations?.map((toolInvocation: any) => {
                    const toolCallId = toolInvocation.toolCallId;
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
                
                 {m.role === "user" && (
                   <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                     <User className="h-5 w-5 text-gray-600" />
                   </div>
                )}
              </div>
            ))}
            
            {isLoading && (
               <div className="text-sm text-gray-400 p-4 animate-pulse">AI is typing...</div>
            )}
          </div>
        </ScrollArea>

        {/* Input : type the message to send */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input value={input} onChange={handleInputChange} placeholder="Type your message..." className="flex-1" />
            <Button type="submit" disabled={isLoading} size="icon"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}