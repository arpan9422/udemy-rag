 import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { queryRAG, createThread } from "@/lib/api"; // import createThread
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    file_name: string;
    file_loc: string;
    section: string;
  }>;
  relatedCourseLessons?: Array<{
    section: string;
    title: string;
    // add other lesson fields if needed
  }>;
}

interface QueryResponse {
  conclusion: string;
  structed_sources?: {
    structed_sources?: {
      material_sources?: any[];
      related_course_lessons?: Array<{
        section: string;
        title: string;
        // add other lesson fields if needed
      }>;
    };
  };
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper to extract title from first query
  function getTitleFromQuery(query: string) {
    return query.split(" ").slice(0, 3).join(" ");
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let currentThreadId = threadId;

    // If no threadId, create a new thread using backend API
    if (!currentThreadId) {
      try {
        const title = getTitleFromQuery(input);
        // Always use userId = "arpan_1"
        const res = await createThread({ userId: "arpan_1", title });
        currentThreadId = res.threadId;
        setThreadId(currentThreadId);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create chat thread.",
          variant: "destructive",
        });
        return;
      }
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Pass threadId to backend
      const response: QueryResponse = await queryRAG(input, currentThreadId);
      // Extract answer and sources from backend response
      const answer = response.conclusion;
      // Map sources to expected format
      const sourcesRaw = response.structed_sources?.structed_sources?.material_sources ?? [];
      const sources = sourcesRaw.map((src: any) => ({
        file_name: src.file,
        file_loc: src.file_loc,
        section: src.section,
      }));

      // Extract related_course_lessons from nested structed_sources
      const relatedCourseLessons = response.structed_sources?.structed_sources?.related_course_lessons ?? [];

      const assistantMessage: Message = {
        role: 'assistant',
        content: answer,
        sources: sources,
        // Add relatedCourseLessons as a property
        relatedCourseLessons: relatedCourseLessons,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Udemy RAG Chatbot</h1>
            <p className="text-sm text-muted-foreground">
              Ask questions about your course materials
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <Card className="p-8 bg-card border-border text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Ready to help!</h2>
            <p className="text-muted-foreground">
              Ask me anything about the course materials you've uploaded.
            </p>
          </Card>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            sources={message.sources}
            relatedCourseLessons={message.relatedCourseLessons}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
              </div>
            </Card>
          </div>
        )}


        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your course..."
            className="flex-1 bg-background border-border"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
