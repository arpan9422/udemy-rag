import { useState } from "react";
import { Download, Upload, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusIndicator } from "@/components/scraping/StatusIndicator";
import { FileTree } from "@/components/scraping/FileTree";
import { useToast } from "@/hooks/use-toast";
import {
  scrapeCourse,
  downloadMaterial,
  getFileStructure,
  uploadToPinecone,
  FileStructure,
} from "@/lib/api";

export default function ScrapingPage() {
  const [courseUrl, setCourseUrl] = useState("");
  const [folderName, setfolderName] = useState("");
  const [sectionToProcess, setSectionToProcess] = useState("");
  const [courseName, setCourseName] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState("");
  const [scrapingComplete, setScrapingComplete] = useState(false);
  const [fileStructure, setFileStructure] = useState<FileStructure | null>(null);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!courseUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Udemy course URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus('loading');
      setStatusMessage('Starting scraping...');
      await scrapeCourse(courseUrl, folderName, sectionToProcess, courseName, (message) => setStatusMessage(message));
      setStatus('success');
      setStatusMessage('Course scraped successfully! ✓');
      setScrapingComplete(true);
      toast({
        title: "Success",
        description: "Course materials scraped successfully",
      });
    } catch (error: any) {
      setStatus('error');
      setStatusMessage(error.message || 'Failed to scrape course. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to scrape course materials",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    try {
      setStatus('loading');
      setStatusMessage('Downloading materials...');
      const blob = await downloadMaterial();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'course-materials.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setStatus('success');
      setStatusMessage('Download complete! ✓');
      toast({
        title: "Success",
        description: "Course materials downloaded",
      });
    } catch (error) {
      setStatus('error');
      setStatusMessage('Failed to download materials.');
      toast({
        title: "Error",
        description: "Failed to download materials",
        variant: "destructive",
      });
    }
  };

  const handleOpenZip = async () => {
    try {
      setStatus('loading');
      setStatusMessage('Loading file structure...');
      const structure = await getFileStructure();
      setFileStructure(structure);
      setStatus('success');
      setStatusMessage('File structure loaded! ✓');
    } catch (error) {
      setStatus('error');
      setStatusMessage('Failed to load file structure.');
      toast({
        title: "Error",
        description: "Failed to load file structure",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    try {
      setStatus('loading');
      setStatusMessage('Uploading to Pinecone...');
      await uploadToPinecone();
      setStatus('success');
      setStatusMessage('Successfully uploaded to Pinecone! ✓');
      toast({
        title: "Success",
        description: "Materials uploaded to Pinecone",
      });
    } catch (error) {
      setStatus('error');
      setStatusMessage('Failed to upload to Pinecone.');
      toast({
        title: "Error",
        description: "Failed to upload to Pinecone",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Course Scraping & Upload
          </h1>
          <p className="text-muted-foreground">
            Enter a Udemy course URL to scrape, download, and upload materials to your RAG system.
          </p>
        </div>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div>
              <label htmlFor="courseUrl" className="block text-sm font-medium mb-2">Course URL</label>
              <Input
                id="courseUrl"
                type="url"
                placeholder="https://www.udemy.com/course/..."
                value={courseUrl}
                onChange={(e) => setCourseUrl(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label htmlFor="courseName" className="block text-sm font-medium mb-2">Course Name</label>
              <Input
                id="courseName"
                type="text"
                placeholder="Enter course name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label htmlFor="folderName" className="block text-sm font-medium mb-2">Folder Name</label>
              <Input
                id="folderName"
                type="text"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setfolderName(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label htmlFor="sectionToProcess" className="block text-sm font-medium mb-2">Section to Process</label>
              <Input
                id="sectionToProcess"
                type="text"
                placeholder="Enter section to process"
                value={sectionToProcess}
                onChange={(e) => setSectionToProcess(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <Button onClick={handleScrape} className="w-full bg-primary hover:bg-primary/90">
              Start Scraping
            </Button>

            <StatusIndicator status={status} message={statusMessage} />
          </div>
        </Card>

        {scrapingComplete && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="h-24 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <span>Download Material</span>
            </Button>

            <Button
              onClick={handleOpenZip}
              variant="secondary"
              className="h-24 flex flex-col gap-2"
            >
              <FolderOpen className="h-6 w-6" />
              <span>Open ZIP Files</span>
            </Button>

            <Button
              onClick={handleUpload}
              variant="secondary"
              className="h-24 flex flex-col gap-2"
            >
              <Upload className="h-6 w-6" />
              <span>Upload to Pinecone</span>
            </Button>
          </div>
        )}

        {fileStructure && <FileTree structure={fileStructure} />}
      </div>
    </div>
  );
}
