import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CollaborativeBoardComponent from "@/components/collaborative/CollaborativeBoard";
import ErrorBoundary from "@/components/ErrorBoundary";

const CollaborativeBoard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="container mx-auto py-6">
      <ErrorBoundary>
        <CollaborativeBoardComponent />
      </ErrorBoundary>
    </div>
  );
};

export default CollaborativeBoard; 