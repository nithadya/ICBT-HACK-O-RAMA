import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Topic {
  id: string;
  title: string;
  status: "not_started" | "needs_review" | "understood";
  user_id: string;
  created_at: string;
}

const statusColors = {
  not_started: "bg-gray-200 dark:bg-gray-700",
  needs_review: "bg-yellow-200 dark:bg-yellow-700",
  understood: "bg-green-200 dark:bg-green-700",
};

const statusLabels = {
  not_started: "Not Started",
  needs_review: "Needs Review",
  understood: "Understood",
};

const RevisionTracker = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from("revision_topics")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast({
        title: "Error",
        description: "Failed to load topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTopicStatus = async (topicId: string, status: Topic["status"]) => {
    try {
      const { error } = await supabase
        .from("revision_topics")
        .update({ status })
        .eq("id", topicId);

      if (error) throw error;

      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId ? { ...topic, status } : topic
        )
      );

      toast({
        title: "Success",
        description: "Topic status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating topic:", error);
      toast({
        title: "Error",
        description: "Failed to update topic status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        .status-transition {
          transition: all 0.3s ease-in-out;
        }
      `}} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="p-4">
            <h3 className="font-semibold mb-4">{topic.title}</h3>
            <div className="flex space-x-2">
              {Object.entries(statusLabels).map(([status, label]) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className={`status-transition ${
                    topic.status === status ? statusColors[status as Topic["status"]] : ""
                  }`}
                  onClick={() => updateTopicStatus(topic.id, status as Topic["status"])}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RevisionTracker; 