import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, ThumbsUp, Flag, CheckCircle2 } from "lucide-react";

interface User {
  email: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  votes: number;
  flags: number;
  type: "question" | "explanation";
  status: "open" | "resolved";
  user: User;
}

interface Answer {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  votes: number;
  is_accepted: boolean;
  user: User;
}

const CollaborativeBoard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "question" | "explanation">("all");
  const [sort, setSort] = useState<"votes" | "recent">("recent");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", type: "question" as const });
  const [newAnswer, setNewAnswer] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const fetchUserDetails = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("email:id, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      return null;
    }

    return data;
  };

  const fetchData = async () => {
    try {
      // Fetch posts
      let query = supabase
        .from("collaborative_posts")
        .select("*");

      if (filter !== "all") {
        query = query.eq("type", filter);
      }

      if (sort === "votes") {
        query = query.order("votes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        console.error("Posts error:", postsError);
        throw postsError;
      }

      // Fetch user details for each post
      const postsWithUsers = await Promise.all(
        (postsData || []).map(async (post) => {
          const userDetails = await fetchUserDetails(post.user_id);
          return {
            ...post,
            user: userDetails || { email: "Unknown", avatar_url: null },
          };
        })
      );

      setPosts(postsWithUsers);

      // Fetch answers for all posts
      if (postsData?.length) {
        const { data: answersData, error: answersError } = await supabase
          .from("collaborative_answers")
          .select("*")
          .in("post_id", postsData.map(post => post.id))
          .order("votes", { ascending: false });

        if (answersError) {
          console.error("Answers error:", answersError);
          throw answersError;
        }

        // Fetch user details for each answer
        const answersWithUsers = await Promise.all(
          (answersData || []).map(async (answer) => {
            const userDetails = await fetchUserDetails(answer.user_id);
            return {
              ...answer,
              user: userDetails || { email: "Unknown", avatar_url: null },
            };
          })
        );

        // Group answers by post_id
        const answersMap = answersWithUsers.reduce((acc, answer) => {
          acc[answer.post_id] = [...(acc[answer.post_id] || []), answer];
          return acc;
        }, {} as Record<string, Answer[]>);

        setAnswers(answersMap);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [filter, sort, user]);

  const handleAddPost = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("collaborative_posts")
        .insert({
          title: newPost.title,
          content: newPost.content,
          type: newPost.type,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const userDetails = await fetchUserDetails(user.id);
      const newPostWithUser = {
        ...data,
        user: userDetails || { email: "Unknown", avatar_url: null },
      };

      setPosts(prev => [newPostWithUser, ...prev]);
      setIsDialogOpen(false);
      setNewPost({ title: "", content: "", type: "question" });
      
      toast({
        title: "Success",
        description: "Your question has been posted.",
      });
    } catch (error) {
      console.error("Error adding post:", error);
      toast({
        title: "Error",
        description: "Failed to post your question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAnswer = async (postId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to answer.",
        variant: "destructive",
      });
      return;
    }

    if (!newAnswer[postId]) {
      toast({
        title: "Error",
        description: "Answer cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("collaborative_answers")
        .insert({
          content: newAnswer[postId],
          post_id: postId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const userDetails = await fetchUserDetails(user.id);
      const newAnswerWithUser = {
        ...data,
        user: userDetails || { email: "Unknown", avatar_url: null },
      };

      setAnswers(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newAnswerWithUser],
      }));
      
      setNewAnswer(prev => ({ ...prev, [postId]: "" }));
      
      toast({
        title: "Success",
        description: "Your answer has been posted.",
      });
    } catch (error) {
      console.error("Error adding answer:", error);
      toast({
        title: "Error",
        description: "Failed to post your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (type: "post" | "answer", id: string, currentVotes: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from(type === "post" ? "collaborative_posts" : "collaborative_answers")
        .update({ votes: currentVotes + 1 })
        .eq("id", id);

      if (error) throw error;

      if (type === "post") {
        setPosts(prev =>
          prev.map(post =>
            post.id === id ? { ...post, votes: post.votes + 1 } : post
          )
        );
      } else {
        setAnswers(prev => {
          const newAnswers = { ...prev };
          Object.keys(newAnswers).forEach(postId => {
            newAnswers[postId] = newAnswers[postId].map(answer =>
              answer.id === id ? { ...answer, votes: answer.votes + 1 } : answer
            );
          });
          return newAnswers;
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to register vote. Please try again.",
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
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "question" ? "default" : "outline"}
            onClick={() => setFilter("question")}
          >
            Questions
          </Button>
          <Button
            variant={filter === "explanation" ? "default" : "outline"}
            onClick={() => setFilter("explanation")}
          >
            Explanations
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="space-x-2">
            <Button
              variant={sort === "recent" ? "default" : "outline"}
              onClick={() => setSort("recent")}
            >
              Recent
            </Button>
            <Button
              variant={sort === "votes" ? "default" : "outline"}
              onClick={() => setSort("votes")}
            >
              Most Voted
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
                <DialogDescription>
                  Share your question with the community. Be specific and provide context.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What's your question?"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Details</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Provide more details about your question..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPost}>Post Question</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.content}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={post.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {post.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-500">
                      {post.user.email}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleVote("post", post.id, post.votes)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.votes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-red-500"
                >
                  <Flag className="h-4 w-4" />
                  {post.flags}
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  {answers[post.id]?.length || 0} Answer{answers[post.id]?.length !== 1 ? "s" : ""}
                </h4>
              </div>

              <div className="space-y-4">
                {answers[post.id]?.map((answer) => (
                  <div
                    key={answer.id}
                    className="pl-6 border-l-2 border-gray-200 dark:border-gray-700"
                  >
                    <p className="mb-2">{answer.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={answer.user.avatar_url || undefined} />
                          <AvatarFallback>
                            {answer.user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-500">
                          {answer.user.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {new Date(answer.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleVote("answer", answer.id, answer.votes)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {answer.votes}
                        </Button>
                        {answer.is_accepted && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4">
                  <Textarea
                    placeholder="Write your answer..."
                    value={newAnswer[post.id] || ""}
                    onChange={(e) =>
                      setNewAnswer(prev => ({ ...prev, [post.id]: e.target.value }))
                    }
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      onClick={() => handleAddAnswer(post.id)}
                      disabled={!newAnswer[post.id]}
                    >
                      Post Answer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeBoard;