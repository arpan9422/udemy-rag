import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, FolderOpen } from "lucide-react";
import { FileStructure } from "@/lib/api";
import { Card } from "@/components/ui/card";

interface FileTreeProps {
  structure: FileStructure;
}

export const FileTree = ({ structure }: FileTreeProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Downloaded Materials</h3>
      </div>
      
      <div className="space-y-2">
        {structure.sections.map((section) => {
          const isExpanded = expandedSections.has(section.section);
          
          return (
            <div key={section.section} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.section)}
                className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted transition-smooth text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{section.section}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {section.files.length} file{section.files.length !== 1 ? 's' : ''}
                </span>
              </button>
              
              {isExpanded && (
                <div className="p-2 space-y-1 bg-background">
                  {section.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-smooth"
                    >
                      <FileText className="h-4 w-4 text-accent" />
                      <span className="text-sm font-mono text-foreground/90">
                        {file.file_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
