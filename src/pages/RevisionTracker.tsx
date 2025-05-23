import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CourseRevisionTracker from "@/components/revision/CourseRevisionTracker";

const RevisionTrackerPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Revision Tracker</h1>
      <CourseRevisionTracker />
    </div>
  );
};

export default RevisionTrackerPage; 