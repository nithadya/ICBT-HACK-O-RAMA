import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CourseFiltersProps {
  onFilterChange: (filters: {
    search: string;
    subject: string | null;
    semester: string | null;
    year: number | null;
  }) => void;
}

const CourseFilters = ({ onFilterChange }: CourseFiltersProps) => {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [semester, setSemester] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // Fetch unique subjects
      const { data: subjectsData } = await supabase
        .from('courses')
        .select('subject')
        .not('subject', 'is', null);
      
      if (subjectsData) {
        const uniqueSubjects = [...new Set(subjectsData.map(item => item.subject))];
        setSubjects(uniqueSubjects as string[]);
      }

      // Fetch unique semesters
      const { data: semestersData } = await supabase
        .from('courses')
        .select('semester')
        .not('semester', 'is', null);
      
      if (semestersData) {
        const uniqueSemesters = [...new Set(semestersData.map(item => item.semester))];
        setSemesters(uniqueSemesters as string[]);
      }

      // Fetch unique years
      const { data: yearsData } = await supabase
        .from('courses')
        .select('year')
        .not('year', 'is', null);
      
      if (yearsData) {
        const uniqueYears = [...new Set(yearsData.map(item => item.year))];
        setYears(uniqueYears as number[]);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = () => {
    onFilterChange({
      search,
      subject,
      semester,
      year
    });
  };

  const handleReset = () => {
    setSearch("");
    setSubject(null);
    setSemester(null);
    setYear(null);
    onFilterChange({
      search: "",
      subject: null,
      semester: null,
      year: null
    });
  };

  useEffect(() => {
    handleFilterChange();
  }, [search, subject, semester, year]);

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Label htmlFor="search">Search Courses</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="search"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Select value={subject || undefined} onValueChange={setSubject}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester Filter */}
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Select value={semester || undefined} onValueChange={setSemester}>
            <SelectTrigger id="semester">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div>
          <Label htmlFor="year">Year</Label>
          <Select 
            value={year?.toString() || undefined} 
            onValueChange={(val) => setYear(val === "all" ? null : parseInt(val))}
          >
            <SelectTrigger id="year">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Filters Button */}
      {(search || subject || semester || year) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="mt-4 flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
      )}
    </div>
  );
};

export default CourseFilters; 