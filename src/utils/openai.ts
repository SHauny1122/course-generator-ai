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

async function updateTokenUsage(tokenCount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('tokens_used')
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    console.error('Error fetching token usage:', fetchError);
    return;
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ tokens_used: (subscription?.tokens_used || 0) + tokenCount })
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Error updating token usage:', updateError);
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
