import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  FileText, 
  Layers, 
  BarChart2, 
  Trophy 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/dashboard/StatsCard";
import CourseCard from "@/components/dashboard/CourseCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import UpcomingAssignments from "@/components/dashboard/UpcomingAssignments";
import LeaderboardPreview from "@/components/dashboard/LeaderboardPreview";
import CourseFilters from "@/components/dashboard/CourseFilters";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  description: string | null;
  is_paid: boolean | null;
  price: number | null;
  cover_image: string | null;
  subject: string | null;
  semester: string | null;
  year: number | null;
  enrolled?: boolean;
}

interface Filters {
  search: string;
  subject: string | null;
  semester: string | null;
  year: number | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [userStats, setUserStats] = useState({
    enrolledCourses: 0,
    notesUploaded: 0,
    flashcardsCreated: 0,
    revisionTopics: 0,
    totalPoints: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    subject: null,
    semester: null,
    year: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchUserStats();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, courses]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (coursesError) throw coursesError;
      
      // Fetch user enrollments if user is logged in
      if (user) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("user_id", user.id);
        
        if (enrollmentsError) throw enrollmentsError;
        
        // Add enrolled property to courses
        const enrolledCourseIds = (enrollmentsData || []).map(e => e.course_id);
        const coursesWithEnrollment = (coursesData || []).map(course => ({
          ...course,
          enrolled: enrolledCourseIds.includes(course.id)
        }));
        
        setCourses(coursesWithEnrollment);
        setFilteredCourses(coursesWithEnrollment);
      } else {
        setCourses(coursesData || []);
        setFilteredCourses(coursesData || []);
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      if (!user) return;
      
      // Fetch enrolled courses count
      const { count: enrolledCount, error: enrolledError } = await supabase
        .from("enrollments")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);
      
      if (enrolledError) throw enrolledError;
      
      // Fetch user points and stats
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (pointsError && pointsError.code !== "PGRST116") throw pointsError;
      
      // Fetch revision topics count
      const { count: revisionCount, error: revisionError } = await supabase
        .from("revision_trackers")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);
      
      if (revisionError) throw revisionError;
      
      setUserStats({
        enrolledCourses: enrolledCount || 0,
        notesUploaded: pointsData?.notes_uploaded || 0,
        flashcardsCreated: pointsData?.flashcards_created || 0,
        revisionTopics: revisionCount || 0,
        totalPoints: pointsData?.points || 0
      });
      
    } catch (error: any) {
      console.error("Error fetching user stats:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        (course.description?.toLowerCase().includes(searchTerm))
      );
    }

    // Apply subject filter
    if (filters.subject && filters.subject !== "all") {
      filtered = filtered.filter(course => course.subject === filters.subject);
    }

    // Apply semester filter
    if (filters.semester && filters.semester !== "all") {
      filtered = filtered.filter(course => course.semester === filters.semester);
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(course => course.year === filters.year);
    }

    setFilteredCourses(filtered);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const freeCourses = filteredCourses.filter(course => !course.is_paid);
  const paidCourses = filteredCourses.filter(course => course.is_paid);
  const enrolledCourses = filteredCourses.filter(course => course.enrolled);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to ClassSync</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your smart collaborative learning platform
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard 
          title="Enrolled Courses" 
          value={userStats.enrolledCourses} 
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatsCard 
          title="Notes Uploaded" 
          value={userStats.notesUploaded} 
          icon={<FileText className="h-4 w-4" />}
        />
        <StatsCard 
          title="Flashcards Created" 
          value={userStats.flashcardsCreated} 
          icon={<Layers className="h-4 w-4" />}
        />
        <StatsCard 
          title="Revision Topics" 
          value={userStats.revisionTopics} 
          icon={<BarChart2 className="h-4 w-4" />}
        />
        <StatsCard 
          title="Total Points" 
          value={userStats.totalPoints} 
          icon={<Trophy className="h-4 w-4" />} 
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-100 dark:border-blue-900"
        />
      </div>
      
      {/* Course Filters */}
      <CourseFilters onFilterChange={handleFilterChange} />
      
      {/* Course Tabs */}
      <div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="enrolled" disabled={enrolledCourses.length === 0}>My Courses</TabsTrigger>
            <TabsTrigger value="free" disabled={freeCourses.length === 0}>Free Courses</TabsTrigger>
            <TabsTrigger value="premium" disabled={paidCourses.length === 0}>Premium Courses</TabsTrigger>
            <Button variant="ghost" onClick={() => navigate("/notes")} className="px-4">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </Button>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[400px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description || ""}
                    isPaid={course.is_paid || false}
                    price={course.price || 0}
                    coverImage={course.cover_image || ""}
                    enrolled={course.enrolled}
                    subject={course.subject || undefined}
                    semester={course.semester || undefined}
                    year={course.year || undefined}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No courses found.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="enrolled">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description || ""}
                    isPaid={course.is_paid || false}
                    price={course.price || 0}
                    coverImage={course.cover_image || ""}
                    enrolled={true}
                    subject={course.subject || undefined}
                    semester={course.semester || undefined}
                    year={course.year || undefined}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg">You haven't enrolled in any courses yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="free">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description || ""}
                  isPaid={false}
                  price={0}
                  coverImage={course.cover_image || ""}
                  enrolled={course.enrolled}
                  subject={course.subject || undefined}
                  semester={course.semester || undefined}
                  year={course.year || undefined}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="premium">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description || ""}
                  isPaid={true}
                  price={course.price || 0}
                  coverImage={course.cover_image || ""}
                  enrolled={course.enrolled}
                  subject={course.subject || undefined}
                  semester={course.semester || undefined}
                  year={course.year || undefined}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Activity & Progress Section */}
      <div className="grid grid-cols-4 gap-4">
        <ActivityChart />
        <UpcomingAssignments />
        <LeaderboardPreview />
      </div>
    </div>
  );
};

export default Dashboard;
