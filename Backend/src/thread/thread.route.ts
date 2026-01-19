import { Router } from "express";
import { ThreadController } from "./thread.controller";

const router = Router();

// Create a thread
router.post("/create", ThreadController.createThread);

// Add message to thread
router.post("/message", ThreadController.addMessage);

// Get all messages for a thread
router.get("/:threadId/messages", ThreadController.getMessages);

router.get('/allThreads', ThreadController.getAllThreads)

export default router;
