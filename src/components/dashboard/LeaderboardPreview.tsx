
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const leaderboardData = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=1",
    points: 1250,
    rank: 1,
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?img=2",
    points: 980,
    rank: 2,
  },
  {
    id: "3",
    name: "Alex Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=3",
    points: 845,
    rank: 3,
  },
  {
    id: "4",
    name: "Jessica Williams",
    avatar: "https://i.pravatar.cc/150?img=4",
    points: 720,
    rank: 4,
  },
  {
    id: "5",
    name: "Robert Taylor",
    avatar: "https://i.pravatar.cc/150?img=5",
    points: 645,
    rank: 5,
  },
];

const LeaderboardPreview = () => {
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Leaderboard</CardTitle>
        <Link to="/leaderboard">
          <Button variant="ghost" size="sm" className="gap-1">
            View Full <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboardData.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 font-semibold text-sm">
                  {user.rank === 1 ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 h-7 w-7 rounded-full flex items-center justify-center p-0">
                      {user.rank}
                    </Badge>
                  ) : user.rank === 2 ? (
                    <Badge className="bg-gray-400 hover:bg-gray-500 h-7 w-7 rounded-full flex items-center justify-center p-0">
                      {user.rank}
                    </Badge>
                  ) : user.rank === 3 ? (
                    <Badge className="bg-amber-700 hover:bg-amber-800 h-7 w-7 rounded-full flex items-center justify-center p-0">
                      {user.rank}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">{user.rank}</span>
                  )}
                </div>
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="font-semibold">{user.points.toLocaleString()} pts</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardPreview;
