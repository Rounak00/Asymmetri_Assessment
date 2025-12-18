"use server";

import { db } from "@/db";
import { chats, messages as messagesTable } from "@/db/schema";
import { auth } from "@/config/authHandler";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Create a New Chat ID
// This is called when the user lands on the page or clicks "New Chat"
export async function createChat(title: string = "New Conversation") {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [newChat] = await db
    .insert(chats)
    .values({
      userId: session.user.id,
      title: title,
    })
    .returning();
  revalidatePath("/");
  return newChat.id;
}

//Get All Chats (For Sidebar)
export async function getChats() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db
    .select()
    .from(chats)
    .where(eq(chats.userId, session.user.id))
    .orderBy(desc(chats.createdAt)); // Newest first
}

//Get Messages for a Specific Chat - use in showing history
export async function getChatMessages(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId))
    .orderBy(messagesTable.createdAt);
}