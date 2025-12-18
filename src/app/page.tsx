import { auth } from "@/config/authHandler";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/chat/chat-interface";
import { createChat, getChats, getChatMessages } from "@/app/actions";
import { CMessage } from "@/types";

export default async function Home({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  //Authentication vcheck
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  //handle chat ID Logic
  let currentChatId = searchParams.id;
  let chatMessages: CMessage[] = [];

  // Case A: User just landed on "/" -> Create a new chat and redirect to it
  if (!currentChatId) {
    const newId = await createChat("New Conversation");
    if (newId) {
      redirect(`/?id=${newId}`);
    }
  } else {
    // Case B: User has an ID -> Load the message history for that chat
    const dbMessages = await getChatMessages(currentChatId);

    chatMessages = dbMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }));
  }

  //Fetch Sidebar History (List of all chats)
  const history = await getChats();

  return (
    <ChatInterface
      userName={session.user.name || "User"}
      initialChatId={currentChatId!}
      history={history}
      initialMessages={chatMessages}
    />
  );
}