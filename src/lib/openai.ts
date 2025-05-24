import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made through a backend
});

interface ContentAnalysisResult {
  isFlagged: boolean;
  category?: string;
  confidence?: number;
  explanation?: string;
}

export async function analyzeContent(content: string): Promise<ContentAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a content moderation system. Analyze the following content for:
1. Academic dishonesty (cheating, plagiarism, selling answers)
2. Inappropriate content (adult content, violence, hate speech)
3. Spam or misleading information
4. Personal information exposure

Respond in JSON format only with the following structure:
{
  "isFlagged": boolean,
  "category": string (if flagged),
  "confidence": number between 0 and 1,
  "explanation": string (if flagged)
}`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      isFlagged: result.isFlagged || false,
      category: result.category,
      confidence: result.confidence,
      explanation: result.explanation
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return safe default if analysis fails
    return { isFlagged: false };
  }
}

export default openai; 