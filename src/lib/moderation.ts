import { analyzeContent } from './openai';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ModerationResult {
  isAllowed: boolean;
  category?: string;
  confidence?: number;
  explanation?: string;
}

export async function moderateContent(content: string, type: string, contentId: string): Promise<ModerationResult> {
  try {
    // Analyze content using OpenAI
    const result = await analyzeContent(content);
    
    // If content is flagged, automatically create a flagged_content record
    if (result.isFlagged) {
      try {
        await supabase.from('flagged_content').insert({
          content_id: contentId,
          type,
          content,
          reason: `Automatically flagged for ${result.category}`,
          status: 'pending',
          ai_analysis: {
            category: result.category,
            confidence: result.confidence,
            explanation: result.explanation
          }
        });

        toast({
          title: "Content Flagged",
          description: `This content has been flagged for ${result.category}: ${result.explanation}`,
          variant: "destructive",
        });
      } catch (error) {
        console.error('Error saving flagged content:', error);
      }

      return {
        isAllowed: false,
        category: result.category,
        confidence: result.confidence,
        explanation: result.explanation
      };
    }
    
    return { isAllowed: true };
  } catch (error) {
    console.error('Content moderation error:', error);
    // If moderation fails, we'll allow the content but log the error
    return { isAllowed: true };
  }
}

export async function reportContent(contentId: string, type: string, content: string, reason: string) {
  try {
    const { error } = await supabase.from('flagged_content').insert({
      content_id: contentId,
      type,
      content,
      reason,
      status: 'pending'
    });

    if (error) throw error;

    toast({
      title: "Content Reported",
      description: "Thank you for reporting this content. Our moderators will review it.",
    });

    return true;
  } catch (error) {
    console.error('Error reporting content:', error);
    toast({
      title: "Error",
      description: "Failed to report content. Please try again.",
      variant: "destructive",
    });
    return false;
  }
} 