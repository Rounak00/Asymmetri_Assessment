import { auth } from "@/config/authHandler";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/chat/chat-interface";

export default async function Home() {
  //Server-Side Security Check
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    //  Pass the user data to the client component
    <ChatInterface userName={session.user?.name || "User"} />
  );
}