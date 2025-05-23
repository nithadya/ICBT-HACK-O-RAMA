import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Calendar } from "lucide-react";
import AddRevisionTopic from "./AddRevisionTopic";

interface RevisionTopic {
  id: string;
  topic: string;
  lecture_no: number;
  date: string;
  attended: boolean;
  reviewed: boolean;
  notes_completed: boolean;
  end_date: string;
  course_id: string;
}

interface Course {
  id: string;
  title: string;
}

export const CourseRevisionTracker = () => {
  const [topics, setTopics] = useState<RevisionTopic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchTopics();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");

      if (error) throw error;
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("revision_trackers")
        .select("*")
        .eq("course_id", selectedCourse)
        .eq("user_id", user?.id)
        .order("lecture_no");

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast({
        title: "Error",
        description: "Failed to load revision topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTopicStatus = async (topicId: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from("revision_trackers")
        .update({ [field]: value })
        .eq("id", topicId);

      if (error) throw error;

      setTopics(topics.map(topic => 
        topic.id === topicId ? { ...topic, [field]: value } : topic
      ));

      toast({
        title: "Success",
        description: "Topic status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating topic status:", error);
      toast({
        title: "Error",
        description: "Failed to update topic status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const StatusIcon = ({ status }: { status: boolean }) => (
    status ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-red-500" />
    )
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Course Revision Tracker</h2>
          {selectedCourse && <AddRevisionTopic courseId={selectedCourse} onTopicAdded={fetchTopics} />}
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Course" />
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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Lecture No.</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[100px]">Attended</TableHead>
              <TableHead className="w-[100px]">Reviewed</TableHead>
              <TableHead className="w-[100px]">Notes</TableHead>
              <TableHead className="w-[120px]">End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>{topic.lecture_no}</TableCell>
                <TableCell>{topic.topic}</TableCell>
                <TableCell>{new Date(topic.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateTopicStatus(topic.id, "attended", !topic.attended)}
                  >
                    <StatusIcon status={topic.attended} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateTopicStatus(topic.id, "reviewed", !topic.reviewed)}
                  >
                    <StatusIcon status={topic.reviewed} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateTopicStatus(topic.id, "notes_completed", !topic.notes_completed)}
                  >
                    <StatusIcon status={topic.notes_completed} />
                  </Button>
                </TableCell>
                <TableCell>{new Date(topic.end_date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {topics.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg">No revision topics found</p>
          <p className="text-sm">Add your first topic using the button above</p>
        </div>
      )}
    </Card>
  );
};

export default CourseRevisionTracker; 