import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import FlashcardCreate from "@/components/flashcards/FlashcardCreate";
import FlashcardList from "@/components/flashcards/FlashcardList";

const Flashcards = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <FlashcardCreate />
      </div>
      <FlashcardList />
    </div>
  );
};

export default Flashcards; 