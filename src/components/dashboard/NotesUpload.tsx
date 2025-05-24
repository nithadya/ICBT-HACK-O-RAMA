import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";
import { moderateContent } from "@/lib/moderation";

interface Subject {
  id: string;
  name: string;
  category: string;
}

interface Course {
  id: string;
  title: string;
}

interface NotesUploadProps {
  onUploadComplete?: () => void;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const NotesUpload = ({ onUploadComplete }: NotesUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [isPublic, setIsPublic] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch courses when dialog opens
  const handleDialogOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title');
        
        if (error) throw error;
        
        if (data) {
          setCourses(data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    } else {
      // Reset form when dialog closes
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setCourseId("");
    setIsPublic(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "File type not supported",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload notes.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title || !courseId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (title and course).",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage first
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      // Create note record in database
      const { data: noteData, error: dbError } = await supabase
        .from('notes')
        .insert({
          title,
          content: description,
          course_id: courseId,
          file_url: publicUrl,
          file_type: selectedFile.type,
          is_public: isPublic,
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Moderate the content after saving
      const contentToModerate = `${title}\n${description || ''}`;
      const moderationResult = await moderateContent(contentToModerate, 'notes', noteData.id);

      // If content is not allowed, hide it immediately
      if (!moderationResult.isAllowed) {
        await supabase
          .from('notes')
          .update({ is_hidden: true })
          .eq('id', noteData.id);
      }

      toast({
        title: "Success",
        description: "Note uploaded successfully!",
      });

      // Close dialog and reset form
      setIsOpen(false);
      resetForm();
      
      // Trigger refresh of notes list
      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Notes</DialogTitle>
          <DialogDescription>
            Share your notes with others. Supported formats: PDF, PowerPoint, images (JPEG, PNG, GIF), and text files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={ALLOWED_FILE_TYPES.join(",")}
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              disabled={isUploading}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter note description"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="course">Course *</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isUploading}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublic">Make this note public</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotesUpload; 