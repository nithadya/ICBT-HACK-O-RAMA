import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  year: number;
  is_paid: boolean;
  price: number;
  created_at: string;
}

const Courses = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const isContributor = user?.user_metadata?.role === "contributor";

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }

    fetchCourses();
  }, [user, isLoading, navigate]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>
        {isContributor && (
          <Button onClick={() => navigate("/app/courses/manage")}>
            <Plus className="w-4 h-4 mr-2" />
            Manage Courses
          </Button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No courses available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {course.subject} • {course.semester} Semester {course.year}
                    </CardDescription>
                  </div>
                  {course.is_paid && (
                    <Badge variant="secondary" className="ml-2">
                      ${course.price.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {course.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={() => navigate(`/app/courses/${course.id}`)}>
                  View Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses; 