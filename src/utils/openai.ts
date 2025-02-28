import OpenAI from 'openai';
import { 
  courseSchema, 
  quizSchema, 
  lessonSchema,
  CourseStructure,
  QuizStructure,
  LessonStructure 
} from '../types/schemas';
import { supabase } from '../lib/supabaseClient';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo, in production we should use server-side calls
});

// Free tier limits
const FREE_TIER_LIMITS = {
  MONTHLY_TOKENS: 5000,
  MONTHLY_COURSES: 5,
  MONTHLY_QUIZZES: 10
};

// Check if user has exceeded free tier limits
export async function checkFreeTierLimits(type: 'token' | 'course' | 'quiz', amount: number = 1): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return false;
  }

  // If not free tier, allow everything
  if (subscription.tier !== 'free') return true;

  // Check limits based on type
  switch (type) {
    case 'token':
      return (subscription.tokens_used + amount) <= FREE_TIER_LIMITS.MONTHLY_TOKENS;
    case 'course':
      return (subscription.courses_used + amount) <= FREE_TIER_LIMITS.MONTHLY_COURSES;
    case 'quiz':
      return (subscription.quizzes_used + amount) <= FREE_TIER_LIMITS.MONTHLY_QUIZZES;
    default:
      return false;
  }
}

// Update usage counts
export async function updateUsage(type: 'token' | 'course' | 'quiz', amount: number = 1) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const updateData = {
    [type === 'token' ? 'tokens_used' : 
     type === 'course' ? 'courses_used' : 
     'quizzes_used']: (subscription?.[type === 'token' ? 'tokens_used' : 
                                   type === 'course' ? 'courses_used' : 
                                   'quizzes_used'] || 0) + amount
  };

  const { error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('user_id', user.id);

  if (error) {
    console.error(`Error updating ${type} usage:`, error);
  }
}

async function updateTokenUsage(tokenCount: number) {
  const canUseTokens = await checkFreeTierLimits('token', tokenCount);
  if (!canUseTokens) {
    throw new Error('Free tier token limit exceeded. Please upgrade to continue generating content.');
  }
  await updateUsage('token', tokenCount);
}

async function updateCourseUsage(courseCount: number) {
  const canUseCourses = await checkFreeTierLimits('course', courseCount);
  if (!canUseCourses) {
    throw new Error('Free tier course limit exceeded. Please upgrade to continue generating content.');
  }
  await updateUsage('course', courseCount);
}

async function updateQuizUsage(quizCount: number) {
  const canUseQuizzes = await checkFreeTierLimits('quiz', quizCount);
  if (!canUseQuizzes) {
    throw new Error('Free tier quiz limit exceeded. Please upgrade to continue generating content.');
  }
  await updateUsage('quiz', quizCount);
}

// Reset monthly usage if needed
export async function checkAndResetMonthlyUsage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return;
  }

  // Only reset for free tier users
  if (subscription.tier !== 'free') return;

  const lastUpdated = new Date(subscription.updated_at);
  const currentDate = new Date();

  // Check if it's a new month
  if (lastUpdated.getMonth() !== currentDate.getMonth() || 
      lastUpdated.getFullYear() !== currentDate.getFullYear()) {
    
    // Reset usage counts
    const { error: resetError } = await supabase
      .from('subscriptions')
      .update({
        tokens_used: 0,
        courses_used: 0,
        quizzes_used: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (resetError) {
      console.error('Error resetting usage:', resetError);
    }
  }
}

export const generateCourseOutline = async (topic: string, audience: string, duration: string): Promise<CourseStructure> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert course designer specialized in creating educational content.
Your task is to create well-structured, practical course outlines that:
- Are appropriate for the specified audience level
- Have clear learning objectives
- Include practical, hands-on exercises
- Break down complex topics into digestible modules
- Follow a logical progression from basic to advanced concepts
- Focus on real-world applications
- Maintain consistent formatting and structure`
        },
        {
          role: "user",
          content: `Create a detailed course outline for:
Topic: ${topic}
Target Audience: ${audience}
Duration: ${duration}

The course should be comprehensive yet practical, with clear learning objectives and hands-on exercises.`
        }
      ],
      functions: [courseSchema],
      function_call: { name: "generateCourseStructure" },
      temperature: 0.5,
    });

    // Update token usage
    await updateTokenUsage(response.usage?.total_tokens || 0);
    await updateCourseUsage(1);

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to generate course structure');
    }

    return JSON.parse(functionCall.arguments) as CourseStructure;
  } catch (error) {
    console.error('Error generating course outline:', error);
    throw error;
  }
};

export const generateLesson = async (moduleTitle: string, lessonTitle: string): Promise<LessonStructure> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert lesson planner specialized in creating engaging, comprehensive educational content.
Your task is to create detailed lesson plans that:

1. Learning Objectives:
   - Start with clear, measurable learning objectives
   - Use action verbs (understand, apply, analyze, etc.)
   - Focus on practical skills and knowledge

2. Key Concepts:
   - Break down complex topics into fundamental concepts
   - Define technical terms clearly
   - Show relationships between concepts

3. Explanation:
   - Provide thorough, step-by-step explanations
   - Use analogies and real-world connections
   - Include both theoretical background and practical applications
   - Explain the 'why' behind concepts, not just the 'what'
   - Use clear, engaging language

4. Examples:
   - Give multiple, diverse examples
   - Include code snippets where relevant
   - Show both basic and advanced use cases
   - Demonstrate common patterns and best practices
   - Include real-world scenarios

5. Exercises:
   - Create hands-on, practical exercises
   - Progress from basic to advanced
   - Include detailed solutions with explanations
   - Focus on real-world problem-solving
   - Add challenges for advanced learners

6. Summary:
   - Recap key points clearly
   - Connect concepts to practical applications
   - Preview what's coming next
   - Include resources for further learning`
        },
        {
          role: "user",
          content: `Create a comprehensive lesson plan for:
Module: ${moduleTitle}
Lesson: ${lessonTitle}

Make the lesson detailed and practical, with plenty of examples and exercises. Focus on real-world applications and include code examples where relevant.`
        }
      ],
      functions: [lessonSchema],
      function_call: { name: "generateLessonStructure" },
      temperature: 0.5,
    });

    // Update token usage
    await updateTokenUsage(response.usage?.total_tokens || 0);

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to generate lesson structure');
    }

    return JSON.parse(functionCall.arguments) as LessonStructure;
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw error;
  }
};

export const generateQuiz = async (
  topic: string, 
  difficulty: string, 
  questionTypes: { 
    mcq: number; 
    fill: number; 
    tf: number; 
    short: number; 
  }
): Promise<QuizStructure> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert quiz creator specialized in educational assessment.
Your task is to create well-structured quizzes that:
- Match the specified difficulty level exactly
- Test understanding, not just memorization
- Use clear, unambiguous language
- Provide specific, accurate answers
- Follow consistent formatting
- Cover key concepts comprehensively`
        },
        {
          role: "user",
          content: `Generate a quiz on ${topic} for a ${difficulty} level student.
The quiz should include:
- ${questionTypes.mcq} multiple-choice questions
- ${questionTypes.fill} fill-in-the-blank questions
- ${questionTypes.tf} true/false questions
- ${questionTypes.short} short-answer questions

Ensure questions are appropriate for the ${difficulty} level and cover different aspects of the topic.`
        }
      ],
      functions: [quizSchema],
      function_call: { name: "generateQuizStructure" },
      temperature: 0.5,
    });

    // Update token usage
    await updateTokenUsage(response.usage?.total_tokens || 0);
    await updateQuizUsage(1);

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to generate quiz structure');
    }

    return JSON.parse(functionCall.arguments) as QuizStructure;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};
