import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Award, Star, TrendingUp, FileText, HelpCircle } from "lucide-react";

interface LearnerSubmission {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar?: string;
  type: "note" | "question";
  title: string;
  submittedAt: Date;
  currentPoints: number;
  status: "pending" | "reviewed";
}

export function PointsManagement() {
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<LearnerSubmission | null>(null);
  const [pointsToAward, setPointsToAward] = useState(50);

  // Mock data - replace with actual data from your backend
  const pendingSubmissions: LearnerSubmission[] = [
    {
      id: "1",
      learnerId: "learner1",
      learnerName: "John Doe",
      type: "note",
      title: "Advanced React Patterns",
      submittedAt: new Date(),
      currentPoints: 0,
      status: "pending"
    },
    // Add more submissions...
  ];

  const handleAwardPoints = async (submission: LearnerSubmission) => {
    try {
      // Add your API call here to award points
      toast({
        title: "Points Awarded",
        description: `Awarded ${pointsToAward} points to ${submission.learnerName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to award points",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Reviews",
            value: "156",
            icon: Award,
            color: "text-blue-500"
          },
          {
            title: "Points Awarded",
            value: "12,450",
            icon: Star,
            color: "text-yellow-500"
          },
          {
            title: "Notes Reviewed",
            value: "89",
            icon: FileText,
            color: "text-green-500"
          },
          {
            title: "Questions Reviewed",
            value: "67",
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

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>
            Review and award points for learner submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingSubmissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{submission.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      By {submission.learnerName} • {submission.type}
                    </p>
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
                  >
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
                          value={pointsToAward}
                          onChange={(e) => setPointsToAward(Number(e.target.value))}
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
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
          <CardDescription>
            Recent points awarded to learners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add points history items here */}
            <div className="text-center text-muted-foreground py-8">
              No recent activity
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 