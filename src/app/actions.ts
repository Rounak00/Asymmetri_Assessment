// "use server";

// import { db } from "@/db";
// import { chats, messages as messagesTable } from "@/db/schema";
// import { auth } from "@/config/authHandler";
// import { eq, desc, and } from "drizzle-orm";
// import { revalidatePath } from "next/cache";

// // Create a New Chat ID
// // This is called when the user lands on the page or clicks "New Chat"
// export async function createChat(title: string = "New Conversation") {
//   const session = await auth();
//   if (!session?.user?.id) return null;

//   const [newChat] = await db
//     .insert(chats)
//     .values({
//       userId: session.user.id,
//       title: title,
//     })
//     .returning();
//   revalidatePath("/");
//   return newChat.id;
// }

// // Update Chat Title
// export async function updateChatTitle(chatId: string, title: string) {
//   const session = await auth();
//   if (!session?.user?.id) return false;

//   try {
//     await db
//       .update(chats)
//       .set({ title })
//       .where(
//         and(
//           eq(chats.id, chatId),
//           eq(chats.userId, session.user.id)
//         )
//       );

//     revalidatePath("/");
//     return true;
//   } catch (error) {
//     console.error("Error updating chat title:", error);
//     return false;
//   }
// }

// //Get All Chats (For Sidebar)
// export async function getChats() {
//   const session = await auth();
//   if (!session?.user?.id) return [];

//   return await db
//     .select()
//     .from(chats)
//     .where(eq(chats.userId, session.user.id))
//     .orderBy(desc(chats.createdAt)); // Newest first
// }

// //Get Messages for a Specific Chat - use in showing history
// export async function getChatMessages(chatId: string) {
//   const session = await auth();
//   if (!session?.user?.id) return [];

//   return await db
//     .select()
//     .from(messagesTable)
//     .where(eq(messagesTable.chatId, chatId))
//     .orderBy(messagesTable.createdAt);
// }
"use server";

import { db } from "@/db";
import { chats, messages as messagesTable } from "@/db/schema";
import { auth } from "@/config/authHandler";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Create a New Chat ID
export async function createChat(title: string = "New Conversation") {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const [newChat] = await db
      .insert(chats)
      .values({
        userId: session.user.id,
        title: title,
      })
      .returning();

    revalidatePath("/");
    return newChat.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
}

// Update Chat Title
export async function updateChatTitle(chatId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    await db
      .update(chats)
      .set({ title })
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, session.user.id)
        )
      );

    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Error updating chat title:", error);
    return false;
  }
}

// Get All Chats (For Sidebar)
export async function getChats() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.userId, session.user.id))
      .orderBy(desc(chats.createdAt));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

// Get Messages for a Specific Chat
export async function getChatMessages(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    // First verify this chat belongs to the user
    const chat = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, session.user.id)
        )
      )
      .limit(1);

    if (chat.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId))
      .orderBy(messagesTable.createdAt);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// Save a message to database (used by API route)
export async function saveMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
) {
  try {
    const [message] = await db
      .insert(messagesTable)
      .values({
        chatId,
        role,
        content,
      })
      .returning();

    return message;
  } catch (error) {
    console.error("Error saving message:", error);
    return null;
  }
}