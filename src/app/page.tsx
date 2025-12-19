import { auth } from "@/config/authHandler";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/chat/chat-interface";
import { createChat, getChats, getChatMessages } from "@/app/actions";
import { CMessage } from "@/types";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  // Authentication check
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Await searchParams (required in Next.js 14+)
  const params = await searchParams;
  let currentChatId = params.id;
  let chatMessages: CMessage[] = [];

  // Case A: User just landed on "/" -> Create a new chat and redirect to it
  if (!currentChatId) {
    const newId = await createChat("New Conversation");
    if (newId) {
      redirect(`/?id=${newId}`);
    }
    // If createChat failed, show empty state
    return <div>Error creating chat. Please try again.</div>;
  }

  // Case B: User has an ID -> Load the message history for that chat
  const dbMessages = await getChatMessages(currentChatId);
  chatMessages = dbMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Fetch Sidebar History (List of all chats)
  const history = await getChats();

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