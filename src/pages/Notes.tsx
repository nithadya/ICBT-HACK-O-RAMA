import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NotesUpload from "@/components/dashboard/NotesUpload";
import NotesList from "@/components/dashboard/NotesList";

const Notes = () => {
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
        <h1 className="text-3xl font-bold">Study Notes</h1>
        <NotesUpload />
      </div>
      <NotesList />
    </div>
  );
};

export default Notes; 