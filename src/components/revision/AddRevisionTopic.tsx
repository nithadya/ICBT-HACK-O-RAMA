import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface AddRevisionTopicProps {
  courseId: string;
  onTopicAdded: () => void;
}

const AddRevisionTopic = ({ courseId, onTopicAdded }: AddRevisionTopicProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    lecture_no: "",
    date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from("revision_trackers").insert([
        {
          topic: formData.topic,
          lecture_no: parseInt(formData.lecture_no),
          date: new Date(formData.date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          course_id: courseId,
          user_id: user?.id,
          attended: false,
          reviewed: false,
          notes_completed: false,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Topic added successfully.",
      });

      setFormData({
        topic: "",
        lecture_no: "",
        date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
      });
      setIsOpen(false);
      onTopicAdded();
    } catch (error) {
      console.error("Error adding topic:", error);
      toast({
        title: "Error",
        description: "Failed to add topic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Revision Topic</DialogTitle>
          <DialogDescription>
            Add a new topic to track your revision progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="lecture_no">Lecture No.</Label>
            <Input
              id="lecture_no"
              type="number"
              required
              value={formData.lecture_no}
              onChange={(e) =>
                setFormData({ ...formData, lecture_no: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              required
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              required
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Topic"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRevisionTopic; 