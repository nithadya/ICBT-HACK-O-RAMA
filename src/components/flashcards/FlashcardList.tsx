import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, EyeOff, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Subject {
  id: string;
  name: string;
  category: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  subject_id: string;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

const FlashcardList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchFlashcards();
      fetchSubjects();
    }
  }, [user]);

  useEffect(() => {
    filterFlashcards();
  }, [searchTerm, selectedSubjectId, flashcards]);

  const fetchFlashcards = async (retryCount = 0) => {
    setIsLoading(true);
    const maxRetries = 3;
    const retryDelay = (attempt: number) => Math.pow(2, attempt) * 1000;

    const performFetch = async () => {
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .select(`
            *,
            subjects:subject_id (
              name
            )
          `)
          .or(`user_id.eq.${user?.id},is_public.eq.true`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const flashcardsWithSubjects = data?.map(card => ({
          ...card,
          subject: card.subjects?.name || 'Unknown Subject'
        })) || [];

        setFlashcards(flashcardsWithSubjects);
        setFilteredFlashcards(flashcardsWithSubjects);
        return true;
      } catch (error) {
        throw error;
      }
    };

    try {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay(retryCount - 1)));
      }

      await performFetch();
    } catch (error: any) {
      console.error('Error fetching flashcards:', error);
      
      if (retryCount < maxRetries) {
        fetchFlashcards(retryCount + 1);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load flashcards. Please check your network connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const filterFlashcards = () => {
    let filtered = [...flashcards];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(card =>
        card.question.toLowerCase().includes(term) ||
        card.answer.toLowerCase().includes(term)
      );
    }

    if (selectedSubjectId) {
      filtered = filtered.filter(card => card.subject_id === selectedSubjectId);
    }

    setFilteredFlashcards(filtered);
  };

  const toggleAnswer = (id: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={selectedSubjectId || undefined} onValueChange={setSelectedSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredFlashcards.length > 0 ? (
        <div className="grid gap-4">
          {filteredFlashcards.map((card) => (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                  {subjects.find(s => s.id === card.subject_id)?.name || card.subject}
                </span>
                {card.is_public ? (
                  <Eye className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <h3 className="font-medium mb-2">{card.question}</h3>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAnswer(card.id)}
                  className="w-full"
                >
                  {showAnswers[card.id] ? "Hide Answer" : "Show Answer"}
                </Button>
                {showAnswers[card.id] && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    {card.answer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <RefreshCw className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg">No flashcards found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default FlashcardList; 