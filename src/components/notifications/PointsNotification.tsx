import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Trophy } from "lucide-react";

export const PointsNotification = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('points_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_points',
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          const oldPoints = payload.old.points;
          const newPoints = payload.new.points;
          const pointsGained = newPoints - oldPoints;

          if (pointsGained > 0) {
            toast({
              title: "Points Earned! 🎉",
              description: `You've earned ${pointsGained} points!`,
              duration: 5000,
            });
          }

          // Check for level up
          if (payload.new.level !== payload.old.level) {
            toast({
              title: "Level Up! 🌟",
              description: `Congratulations! You've reached ${payload.new.level} level!`,
              duration: 7000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
};

export default PointsNotification; 