import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Download, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id: string;
  title: string;
}

interface Note {
  id: string;
  title: string;
  content: string | null;
  course_id: string;
  course: Course;
  file_url: string | null;
  file_type: string | null;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

const NotesList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [searchTerm, selectedCourseId, notes]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          course:courses(id, title)
        `)
        .or(`user_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
      setFilteredNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');

      if (error) throw error;

      if (data) {
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(term) ||
        note.content?.toLowerCase().includes(term)
      );
    }

    if (selectedCourseId) {
      filtered = filtered.filter(note => note.course_id === selectedCourseId);
    }

    setFilteredNotes(filtered);
  };

  const handleDownload = async (note: Note) => {
    try {
      // Get a fresh public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(note.file_url?.split('/').slice(-2).join('/') || '');
      
      window.open(publicUrl, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileTypeIcon = (fileType: string | null) => {
    // You can add more file type icons here
    return <FileText className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={selectedCourseId || undefined} onValueChange={setSelectedCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4"
            >
              <div className="text-primary">
                {getFileTypeIcon(note.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{note.title}</h3>
                  {note.is_public ? (
                    <Eye className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {note.content && (
                    <p className="truncate">{note.content}</p>
                  )}
                  <p>
                    <span className="font-medium">{note.course?.title || 'Unknown Course'}</span> • {formatDate(note.created_at)}
                  </p>
                </div>
              </div>
              {note.file_url && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownload(note)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg">No notes found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default NotesList; 