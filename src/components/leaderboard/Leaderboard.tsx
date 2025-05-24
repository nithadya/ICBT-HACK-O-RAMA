import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, Star, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CollaboratorPanel } from "./CollaboratorPanel";

interface UserPoints {
  id: string;
  points: number;
  notes_uploaded: number;
  questions_answered: number;
  flashcards_created: number;
  collaborative_posts: number;
  answers_upvoted: number;
  rank: number;
  level: string;
  last_updated: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

type SortOption = "points" | "notes" | "questions";
type TimeRange = "all" | "month" | "week";

const getLevelIcon = (level: string) => {
  switch (level) {
    case "Expert":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "Advanced":
      return <Medal className="h-5 w-5 text-blue-500" />;
    case "Intermediate":
      return <Award className="h-5 w-5 text-green-500" />;
    default:
      return <Star className="h-5 w-5 text-gray-500" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "Expert":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Advanced":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Intermediate":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const Leaderboard = () => {
  const [users, setUsers] = useState<UserPoints[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPoints[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("points");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const { user } = useAuth();
  const [currentUserRank, setCurrentUserRank] = useState<UserPoints | null>(null);

  const calculateLevel = (points: number): string => {
    if (points >= 10000) return "Expert";
    if (points >= 5000) return "Advanced";
    if (points >= 1000) return "Intermediate";
    return "Beginner";
  };

  const fetchLeaderboard = async () => {
    try {
      let query = supabase
        .from("user_points")
        .select("*")
        .order('points', { ascending: false });

      // Apply time range filter
      if (timeRange === "month") {
        query = query.gte('last_updated', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());
      } else if (timeRange === "week") {
        query = query.gte('last_updated', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString());
      }

      const { data: pointsData, error: pointsError } = await query;

      if (pointsError) {
        console.error("Error fetching points:", pointsError);
        throw pointsError;
      }

      if (!pointsData?.length) {
        setUsers([]);
        return;
      }

      // Fetch profiles data
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in('id', pointsData.map(p => p.id));

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Combine and process the data
      const combinedData = pointsData.map((point, index) => ({
        ...point,
        rank: index + 1,
        level: calculateLevel(point.points),
        profiles: profilesData?.find(profile => profile.id === point.id) || {
          full_name: 'Anonymous User',
          avatar_url: null
        }
      }));

      setUsers(combinedData);
      
      if (user) {
        const currentUser = combinedData.find(u => u.id === user.id) || null;
        setCurrentUserRank(currentUser);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription
    const channel = supabase
      .channel('user_points_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeRange]);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "notes":
          return b.notes_uploaded - a.notes_uploaded;
        case "questions":
          return b.questions_answered - a.questions_answered;
        default:
          return b.points - a.points;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchQuery, sortBy]);

  // Add role check
  const isContributor = user?.user_metadata?.role === "contributor";

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Show CollaboratorPanel for contributors */}
      {isContributor && <CollaboratorPanel />}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search learners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
              <SelectItem value="questions">Questions</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <TabsList>
              <TabsTrigger value="all">All Time</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Current User Card */}
      {currentUserRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 bg-primary/5">
            <h2 className="text-xl font-semibold mb-4">Your Ranking</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentUserRank.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {currentUserRank.profiles?.full_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {currentUserRank.profiles?.full_name || 'Anonymous User'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Rank #{currentUserRank.rank}</Badge>
                    <Badge className={getLevelColor(currentUserRank.level)}>
                      {getLevelIcon(currentUserRank.level)}
                      <span className="ml-1">{currentUserRank.level}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{currentUserRank.points}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-2 bg-background rounded-lg">
                <p className="text-lg font-semibold">{currentUserRank.notes_uploaded}</p>
                <p className="text-sm text-muted-foreground">Notes</p>
              </div>
              <div className="text-center p-2 bg-background rounded-lg">
                <p className="text-lg font-semibold">{currentUserRank.questions_answered}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="text-center p-2 bg-background rounded-lg">
                <p className="text-lg font-semibold">{currentUserRank.collaborative_posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress to Next Level</span>
                <span>{currentUserRank.points % 1000}/1000 points</span>
              </div>
              <Progress value={(currentUserRank.points % 1000) / 10} />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard Grid */}
      <div className="grid gap-4">
        {filteredUsers.map((userPoint, index) => (
          <motion.div
            key={userPoint.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="font-semibold text-lg w-8">#{userPoint.rank}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userPoint.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {userPoint.profiles?.full_name?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userPoint.profiles?.full_name}</p>
                    <Badge className={getLevelColor(userPoint.level)}>
                      {getLevelIcon(userPoint.level)}
                      <span className="ml-1">{userPoint.level}</span>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="font-semibold">{userPoint.points}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="font-semibold">{userPoint.notes_uploaded}</p>
                    <p className="text-xs text-muted-foreground">Notes</p>
                  </div>
                  <div>
                    <p className="font-semibold">{userPoint.questions_answered}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div>
                    <p className="font-semibold">{userPoint.collaborative_posts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 