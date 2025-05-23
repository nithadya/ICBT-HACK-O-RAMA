import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [currentUserRank, setCurrentUserRank] = useState<UserPoints | null>(null);

  const fetchLeaderboard = async () => {
    try {
      // First, get user points data
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("*")
        .order('points', { ascending: false })
        .limit(100);

      if (pointsError) {
        console.error("Error fetching points:", pointsError);
        throw pointsError;
      }

      if (!pointsData?.length) {
        setUsers([]);
        return;
      }

      // Then, get profiles data separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in('id', pointsData.map(p => p.id));

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Combine the data
      const combinedData = pointsData.map(point => ({
        ...point,
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

    // Subscribe to realtime updates
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
  }, [user]);

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
    <div className="space-y-6">
      {currentUserRank && (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-2 bg-background rounded-lg">
              <p className="text-lg font-semibold">{currentUserRank.notes_uploaded}</p>
              <p className="text-sm text-muted-foreground">Notes Uploaded</p>
            </div>
            <div className="text-center p-2 bg-background rounded-lg">
              <p className="text-lg font-semibold">{currentUserRank.questions_answered}</p>
              <p className="text-sm text-muted-foreground">Questions Answered</p>
            </div>
            <div className="text-center p-2 bg-background rounded-lg">
              <p className="text-lg font-semibold">{currentUserRank.collaborative_posts}</p>
              <p className="text-sm text-muted-foreground">Posts Created</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Notes</TableHead>
              <TableHead className="text-right">Answers</TableHead>
              <TableHead className="text-right">Posts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userPoint) => (
              <TableRow key={userPoint.id}>
                <TableCell className="font-medium">#{userPoint.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userPoint.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {userPoint.profiles?.full_name?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{userPoint.profiles?.full_name || 'Anonymous User'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getLevelColor(userPoint.level)}>
                    {getLevelIcon(userPoint.level)}
                    <span className="ml-1">{userPoint.level}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {userPoint.points}
                </TableCell>
                <TableCell className="text-right">{userPoint.notes_uploaded}</TableCell>
                <TableCell className="text-right">{userPoint.questions_answered}</TableCell>
                <TableCell className="text-right">{userPoint.collaborative_posts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Leaderboard; 