// @ts-nocheck
import { ZepClient } from "@getzep/zep-cloud";

const zepClient = new ZepClient({
  apiKey: process.env.ZEP_API_KEY!,
});

// const userId = "user_001";

// ✅ Ensure user exists before creating a thread or saving messages
async function ensureUserExists(userId: string) {
  try {
    // Try to fetch the user
    await zepClient.user.get(userId);
    console.log("ℹ️ User already exists:", userId);
  } catch (error: any) {
    // If user not found, create it
    if (error.statusCode === 404) {
      try {
        await zepClient.user.add({
          userId: userId,
          email: `${userId}@example.com`,
          firstName: "Arpan",
          lastName: "Agrawal",
        });
        console.log("✅ User created:", userId);
      } catch (createError) {
        console.error("❌ Failed to create user:", createError);
        throw createError;
      }
    } else {
      console.error("❌ Failed to check user:", error);
      throw error;
    }
  }
}


// ✅ Create a new thread for that user
export async function createThread(threadName, userId) {
  await ensureUserExists(userId);

  const thread = await zepClient.thread.create({
    userId: userId,
    threadId: threadName,
  });

  console.log("✅ Created thread:", thread);
  return thread.threadId;
}

// ✅ Save structured memory (messages) to Zep
export async function saveStructuredMemoryToZep(threadId, userQuery, structuredData) {
  try {
    const messages = [
      {
        role: "user",
        name: "Student",
        content: userQuery,
      },
      {
        role: "assistant",
        name: "System",
        content: JSON.stringify(structuredData, null, 2),
      },
    ];

    const response = await zepClient.thread.addMessages(threadId, {messages});
    console.log("✅ Saved structured memory to Zep:", response);
    return response;
  } catch (error) {
    console.error("❌ Failed to save memory to Zep:", error);
    throw error;
  }
}

// ✅ Get messages from a thread
export async function getThreadMessages(threadId) {
  try {
    const memory = await zepClient.thread.getUserContext(threadId);
    // console.log("✅ Fetched thread messages:", messages);
    return memory;
  } catch (error) {
    console.error("❌ Failed to fetch thread messages:", error);
    return [];
  }
}
