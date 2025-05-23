import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface RevisionTopic {
  id: string;
  title: string;
  description: string;
  next_revision: string;
  revision_count: number;
  user_id: string;
  created_at: string;
}

export const RevisionTracker = () => {
  const [topics, setTopics] = useState<RevisionTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTopic, setNewTopic] = useState({ title: "", description: "" });
  const { user } = useAuth();

  const fetchTopics = async () => {
    try {
      // First check if the table exists
      const { error: tableCheckError } = await supabase
        .from('revision_topics')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        // If table doesn't exist, create it
        await supabase.rpc('create_revision_topics_table');
        return; // Return early as table was just created
      }

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
        description: "Failed to load revision topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTopic = async () => {
    try {
      const { data, error } = await supabase
        .from("revision_topics")
        .insert([
          {
            title: newTopic.title,
            description: newTopic.description,
            user_id: user?.id,
            next_revision: new Date().toISOString(),
            revision_count: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTopics([data, ...topics]);
      setNewTopic({ title: "", description: "" });
      
      toast({
        title: "Success",
        description: "Topic added successfully.",
      });
    } catch (error) {
      console.error("Error adding topic:", error);
      toast({
        title: "Error",
        description: "Failed to add topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markRevised = async (topicId: string) => {
    try {
      const nextRevisionDate = new Date();
      nextRevisionDate.setDate(nextRevisionDate.getDate() + 7); // Next revision in 7 days

      const { data, error } = await supabase
        .from("revision_topics")
        .update({
          next_revision: nextRevisionDate.toISOString(),
          revision_count: topics.find(t => t.id === topicId)!.revision_count + 1,
        })
        .eq("id", topicId)
        .select()
        .single();

      if (error) throw error;

      setTopics(topics.map(topic => 
        topic.id === topicId ? data : topic
      ));

      toast({
        title: "Success",
        description: "Topic marked as revised.",
      });
    } catch (error) {
      console.error("Error marking topic as revised:", error);
      toast({
        title: "Error",
        description: "Failed to update topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTopics();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Topic</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newTopic.title}
              onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter topic title"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newTopic.description}
              onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter topic description"
            />
          </div>
          <Button 
            onClick={addTopic}
            disabled={!newTopic.title.trim()}
          >
            Add Topic
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {topics.map((topic) => (
          <Card key={topic.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{topic.title}</h3>
                <p className="text-muted-foreground mt-1">{topic.description}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Next revision: {new Date(topic.next_revision).toLocaleDateString()}</span>
                  <span>Revised {topic.revision_count} times</span>
                </div>
              </div>
              <Button onClick={() => markRevised(topic.id)}>
                Mark Revised
              </Button>
            </div>
          </Card>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No revision topics yet. Add your first topic above!
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionTracker; 