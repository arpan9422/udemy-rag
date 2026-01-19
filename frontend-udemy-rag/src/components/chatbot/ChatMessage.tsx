import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Source {
  file_name: string;
  file_loc: string;
  section: string;
}

interface RelatedCourseLesson {
  section: string;
  title: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  relatedCourseLessons?: RelatedCourseLesson[];
}

export const ChatMessage = ({ role, content, sources, relatedCourseLessons }: ChatMessageProps) => {
  const isUser = role === 'user';

  // Group lessons by section
  const groupedLessons = (relatedCourseLessons ?? []).reduce((acc: Record<string, RelatedCourseLesson[]>, lesson) => {
    const section = lesson.section || "Unknown Section";
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

  // State for dropdown toggles
  const [openSections, setOpenSections] = useState<{ [section: string]: boolean }>({});
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [relatedOpen, setRelatedOpen] = useState(true);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary' : 'bg-accent'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className="flex flex-col gap-2">
          <Card className={`p-4 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card border-border'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </Card>
          
          {/* Sources Dropdown */}
          {sources && sources.length > 0 && (
            <div className="space-y-2 pl-2">
              <button
                className="flex items-center gap-2 text-xs font-medium mb-1"
                onClick={() => setSourcesOpen((prev) => !prev)}
              >
                {sourcesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="text-muted-foreground">Sources:</span>
              </button>
              {sourcesOpen && (
                <div>
                  {sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={`/pdfs/${source.file_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-smooth group"
                    >
                      <FileText className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-foreground/90 truncate group-hover:text-primary transition-smooth">
                          {source.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {source.section}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        PDF
                      </Badge>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Course Lessons Dropdown */}
          {relatedCourseLessons && Object.keys(groupedLessons).length > 0 && (
            <div className="space-y-2 pl-2">
              <button
                className="flex items-center gap-2 text-xs font-medium mb-1"
                onClick={() => setRelatedOpen((prev) => !prev)}
              >
                {relatedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="text-muted-foreground">Related Course Lessons:</span>
              </button>
              {relatedOpen && (
                <div>
                  {Object.entries(groupedLessons).map(([section, lessons]) => (
                    <div key={section} className="mb-2">
                      {lessons.length > 1 ? (
                        <div className="ml-6 flex flex-col gap-1 p-2 rounded-lg bg-muted/50">
                          <button
                            className="flex items-center gap-2 text-xs font-semibold mb-1 w-full text-left"
                            onClick={() => toggleSection(section)}
                          >
                            {openSections[section] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            <span>{section}</span>
                          </button>
                          {openSections[section] && (
                            <div className="space-y-1">
                              {lessons.map((lesson, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <FileText className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-mono text-foreground/90 truncate">
                                      {lesson.title}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    Lesson
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="ml-6 flex flex-col gap-1 p-2 rounded-lg bg-muted/50">
                          <span className="text-xs font-semibold">{section}</span>
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono text-foreground/90 truncate">
                                {lessons[0].title}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Lesson
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
