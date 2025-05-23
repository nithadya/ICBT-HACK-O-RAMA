import { supabase } from "@/integrations/supabase/client";

export const POINT_VALUES = {
  NOTE_UPLOAD: 50,
  QUESTION_ANSWER: 30,
  COLLABORATIVE_POST: 20,
  UPVOTE_RECEIVED: 5,
  FLASHCARD_CREATED: 10,
} as const;

export type PointAction = keyof typeof POINT_VALUES;

export async function awardPoints(userId: string, action: PointAction) {
  if (!userId) return;

  try {
    const { error } = await supabase.rpc('award_points', {
      user_id_param: userId,
      points_to_add: POINT_VALUES[action],
      action_type: action.toLowerCase()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error awarding points:', error);
  }
} 