import { Leaderboard } from "@/components/leaderboard/Leaderboard";

export const metadata = {
  title: "Leaderboard - ClassSync",
  description: "See top contributors and your ranking in the community.",
};

export default function LeaderboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          See how you rank among other contributors in the community.
        </p>
      </div>
      <Leaderboard />
    </div>
  );
} 