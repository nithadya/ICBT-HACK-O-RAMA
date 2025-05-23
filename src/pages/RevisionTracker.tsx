import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import RevisionTracker from "@/components/revision/RevisionTracker";

const RevisionTrackerPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <RevisionTracker />
    </div>
  );
};

export default RevisionTrackerPage; 