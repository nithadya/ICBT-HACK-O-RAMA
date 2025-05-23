import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Leaderboard as LeaderboardComponent } from "@/components/leaderboard/Leaderboard";

const LeaderboardPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          See how you rank among other contributors in the community.
        </p>
      </div>
      <LeaderboardComponent />
    </div>
  );
};

export default LeaderboardPage; 