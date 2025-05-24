import { motion } from "framer-motion";
import { Crown, Medal, Trophy, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  notesCount: number;
  questionsCount: number;
  level: number;
}

interface LeaderboardCardProps {
  user: LeaderboardUser;
  isCurrentUser?: boolean;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Trophy className="h-6 w-6 text-amber-600" />;
    default:
      return <Award className="h-6 w-6 text-blue-500" />;
  }
};

const getLevelColor = (level: number) => {
  if (level >= 50) return "from-purple-500 to-pink-500";
  if (level >= 30) return "from-blue-500 to-cyan-500";
  if (level >= 20) return "from-green-500 to-emerald-500";
  if (level >= 10) return "from-yellow-500 to-orange-500";
  return "from-gray-500 to-slate-500";
};

export function LeaderboardCard({ user, isCurrentUser = false }: LeaderboardCardProps) {
  const pointsToNextLevel = 1000 - (user.points % 1000);
  const progress = ((user.points % 1000) / 1000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className={`p-4 ${isCurrentUser ? 'border-2 border-primary shadow-lg' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-muted">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1">
              {getRankIcon(user.rank)}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground text-sm">
                  Rank #{user.rank} • Level {user.level}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl bg-gradient-to-r bg-clip-text text-transparent from-primary to-primary/60">
                  {user.points}
                </p>
                <p className="text-muted-foreground text-xs">points</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Level</span>
                <span className="font-medium">{pointsToNextLevel} points needed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-muted p-2">
                <p className="font-semibold">{user.notesCount}</p>
                <p className="text-xs text-muted-foreground">Notes</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="font-semibold">{user.questionsCount}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 