
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const assignments = [
  {
    id: "1",
    title: "Introduction to Quantum Computing",
    course: "Advanced Physics",
    dueDate: "2025-06-01T23:59:59",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Web Development Project",
    course: "Web Development Bootcamp",
    dueDate: "2025-05-28T23:59:59",
    status: "urgent",
  },
  {
    id: "3",
    title: "Data Structures Assignment",
    course: "Introduction to Computer Science",
    dueDate: "2025-06-10T23:59:59",
    status: "upcoming",
  },
];

const UpcomingAssignments = () => {
  // Helper function to format the due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate difference in days
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Assignments</CardTitle>
        <Link to="/assignments">
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{assignment.title}</h4>
                  <Badge variant={assignment.status === "urgent" ? "destructive" : "outline"}>
                    {assignment.status === "urgent" ? "Urgent" : "Upcoming"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {assignment.course}
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarClock className="h-3 w-3" />
                  <span>{formatDueDate(assignment.dueDate)}</span>
                </div>
              </div>
              <Link to={`/assignments/${assignment.id}`}>
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </Link>
            </div>
          ))}

          {assignments.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No upcoming assignments</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingAssignments;
