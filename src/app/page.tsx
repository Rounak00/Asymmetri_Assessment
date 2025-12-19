import { auth } from "@/config/authHandler";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/chat/chat-interface";
import { createChat, getChats, getChatMessages } from "@/app/actions";
import { CMessage, PageProps } from "@/types";



export default async function Home({ searchParams }: PageProps) {
  const session = await auth(); // authentication check
  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams; // await searchParams to get the conversation ID
  let currentChatId = params.id;
  let chatMessages: CMessage[] = [];

  // Case A: User just landed on "/" -> Create a new chat and redirect to it
  if (!currentChatId) {
    const newId = await createChat("New Conversation");
    if (newId) {
      redirect(`/?id=${newId}`);
    }
    return <div>Error creating chat. Please try again.</div>;
  }

  // Case B: User has an ID -> Load the message history for that chat
  const dbMessages = await getChatMessages(currentChatId);
  
  // UPDATED MAPPING LOGIC

  chatMessages = dbMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content || "", // Handle null content safely
    //pass the saved tool data to the frontend so cards persist on refresh
    toolInvocations: (m.toolInvocations as any) || undefined, 
  }));

  const history = await getChats(); // Fetch Sidebar History

  return (
    <ChatInterface
      key={currentChatId}
      userName={session.user.name || "User"}
      initialChatId={currentChatId}
      history={history}
      initialMessages={chatMessages}
    />
  );
}