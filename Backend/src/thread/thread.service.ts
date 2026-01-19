import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ThreadService {
  // Create a thread (with optional thread ID)
  static async createThread(userId: string, title?: string, threadId?: string) {
    const data: any = { userId };
    if (title) data.title = title;
    if (threadId) data.id = threadId;

    const thread = await prisma.thread.create({ data });
    return thread;
  }

  // Add a message to a thread
  static async addMessage(threadId: string, sender: string, content: string, type: string) {
    const message = await prisma.message.create({
      data: { threadId, sender, content, type },
    });
    return message;
  }

  // Retrieve messages from a thread
  static async getMessages(threadId: string) {
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });
    return messages;
  }

  // Optional: Get a thread by ID
  static async getThread(threadId: string) {
    return prisma.thread.findUnique({ where: { id: threadId } });
  }

  static async getallthreads(){
    return prisma.thread.findMany()
  }
}
