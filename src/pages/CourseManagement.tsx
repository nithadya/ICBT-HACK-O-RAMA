import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus,
  FileText,
  Users,
  Settings,
  BarChart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  enrolled_count: number;
  status: string;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeModules: 0,
    completionRate: 0,
  });

  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('creator_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Example stats calculation
      setStats({
        totalCourses: courses.length,
        totalStudents: courses.reduce((acc, course) => acc + (course.enrolled_count || 0), 0),
        activeModules: Math.floor(Math.random() * 50),
        completionRate: Math.floor(Math.random() * 100),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Course
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</p>
              <h3 className="text-2xl font-bold">{stats.totalCourses}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Modules</p>
              <h3 className="text-2xl font-bold">{stats.activeModules}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <BarChart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
              <h3 className="text-2xl font-bold">{stats.completionRate}%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Course List</h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Module Management</h2>
            {/* Add module management interface here */}
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Student Management</h2>
            {/* Add student management interface here */}
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Course Analytics</h2>
            {/* Add analytics interface here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseManagement; 