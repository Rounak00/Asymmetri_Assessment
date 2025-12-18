"use server";

import { db } from "@/db";
import { chats, messages as messagesTable } from "@/db/schema";
import { auth } from "@/config/authHandler";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

//Create a New Chat ID
export async function createChat(title: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [newChat] = await db
    .insert(chats)
    .values({
      userId: session.user.id,
      title: title || "New Conversation",
    })
    .returning();

  revalidatePath("/");
  return newChat.id;
}

// Save a Message (for both User or AI)
export async function saveMessage(chatId: string, role: "user" | "assistant", content: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  await db.insert(messagesTable).values({
    chatId: chatId,
    role: role,
    content: content,
  });
}

//Get Chat Histories
export async function getChats() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await db
    .select()
    .from(chats)
    .where(eq(chats.userId, session.user.id))
    .orderBy(chats.createdAt);
}