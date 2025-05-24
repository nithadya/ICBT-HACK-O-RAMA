import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Award, Star, TrendingUp, FileText, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

interface LearnerSubmission {
  id: string;
  user_id: string;
  type: "note" | "question" | "flashcard" | "post";
  title: string;
  content: string;
  points_awarded: number;
  status: "pending" | "reviewed";
  created_at: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Stats {
  total_reviews: number;
  total_points_awarded: number;
  notes_reviewed: number;
  questions_reviewed: number;
  flashcards_reviewed: number;
  posts_reviewed: number;
}

type PointCategory = "note" | "question" | "flashcard" | "post";

export function CollaboratorPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<LearnerSubmission | null>(null);
  const [pointsToAward, setPointsToAward] = useState(50);
  const [selectedCategory, setSelectedCategory] = useState<PointCategory>("note");
  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState<LearnerSubmission[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_reviews: 0,
    total_points_awarded: 0,
    notes_reviewed: 0,
    questions_reviewed: 0,
    flashcards_reviewed: 0,
    posts_reviewed: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch submissions and stats
  const fetchData = async () => {
    try {
      // First get the submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          id,
          user_id,
          type,
          title,
          content,
          points_awarded,
          status,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError.message);
        throw submissionsError;
      }

      // Transform the data to match our interface
      const transformedSubmissions = submissionsData?.map(submission => ({
        ...submission,
        profile: submission.profiles
      })) || [];

      // Fetch reviewer stats
      const { data: reviewedData, error: reviewedError } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'reviewed')
        .eq('reviewed_by', user?.id);

      if (reviewedError) {
        console.error("Error fetching reviewed submissions:", reviewedError);
        throw reviewedError;
      }

      // Calculate stats
      const calculatedStats: Stats = {
        total_reviews: reviewedData?.length || 0,
        total_points_awarded: reviewedData?.reduce((sum, sub) => sum + (sub.points_awarded || 0), 0) || 0,
        notes_reviewed: reviewedData?.filter(sub => sub.type === 'note').length || 0,
        questions_reviewed: reviewedData?.filter(sub => sub.type === 'question').length || 0,
        flashcards_reviewed: reviewedData?.filter(sub => sub.type === 'flashcard').length || 0,
        posts_reviewed: reviewedData?.filter(sub => sub.type === 'post').length || 0
      };

      setSubmissions(transformedSubmissions);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Show more detailed error message
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: `Failed to load submissions: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load submissions. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();

      // Set up real-time subscription
      const channel = supabase
        .channel('submissions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'submissions'
          },
          () => {
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleAwardPoints = async (submission: LearnerSubmission) => {
    try {
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'reviewed',
          points_awarded: pointsToAward,
          reviewed_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      toast({
        title: "Points Awarded",
        description: `Awarded ${pointsToAward} points to ${submission.profile.full_name}`,
      });

      // Reset selection and refetch data
      setSelectedSubmission(null);
      setPointsToAward(50);
      fetchData();
    } catch (error) {
      console.error("Error awarding points:", error);
      toast({
        title: "Error",
        description: "Failed to award points. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Reviews",
            value: stats.total_reviews,
            icon: Award,
            color: "text-blue-500"
          },
          {
            title: "Points Awarded",
            value: stats.total_points_awarded,
            icon: Star,
            color: "text-yellow-500"
          },
          {
            title: "Notes Reviewed",
            value: stats.notes_reviewed,
            icon: FileText,
            color: "text-green-500"
          },
          {
            title: "Questions Reviewed",
            value: stats.questions_reviewed,
            icon: HelpCircle,
            color: "text-purple-500"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Award Points Section */}
      <Card>
        <CardHeader>
          <CardTitle>Award Points</CardTitle>
          <CardDescription>
            Review and award points for learner submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Category</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value: PointCategory) => setSelectedCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Notes</SelectItem>
                    <SelectItem value="question">Questions</SelectItem>
                    <SelectItem value="flashcard">Flashcards</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Search</Label>
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {submissions
                .filter(sub => 
                  sub.type === selectedCategory &&
                  (searchQuery === "" || 
                   sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   sub.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={submission.profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {submission.profile.full_name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{submission.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          By {submission.profile.full_name} • {submission.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      Review
                    </Button>
                  </div>

                  {selectedSubmission?.id === submission.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 space-y-4"
                      role="dialog"
                      aria-label="Review Submission"
                      aria-describedby="submission-review-description"
                    >
                      {submission.content && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p id="submission-review-description" className="whitespace-pre-wrap">{submission.content}</p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label>Award Points</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[pointsToAward]}
                            onValueChange={(value) => setPointsToAward(value[0])}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={isNaN(pointsToAward) ? 0 : pointsToAward}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setPointsToAward(isNaN(value) ? 0 : Math.max(0, Math.min(100, value)));
                            }}
                            className="w-20"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedSubmission(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleAwardPoints(submission)}
                        >
                          Award Points
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {submissions.filter(sub => sub.type === selectedCategory).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No pending submissions in this category
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 