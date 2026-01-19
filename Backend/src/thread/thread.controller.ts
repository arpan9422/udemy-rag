import { Request, Response } from "express";
import { ThreadService } from "./thread.service";
import { createThread } from "../zep/zepMemory";

export class ThreadController {
  static async createThread(req: Request, res: Response) {
    try {
      const { userId, title } = req.body;
      const threadId = await createThread(title, userId)
      const thread = await ThreadService.createThread(userId, title, threadId);
      
      res.json({ success: true, thread, threadId: threadId});
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async addMessage(req: Request, res: Response) {
    try {
      const { threadId, sender, content, type } = req.body;
      const message = await ThreadService.addMessage(threadId, sender, content, type);
      res.json({ success: true, message });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getMessages(req: Request, res: Response) {
    try {
      const { threadId } = req.params;
      const messages = await ThreadService.getMessages(threadId);
      res.json({ success: true, messages });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
  static async getAllThreads(req: Request, res: Response) {
    try {
      const allThreads = await ThreadService.getallthreads()
      res.json({success: true, threads: allThreads})
    } catch (error) {
      
    }
  }
}
