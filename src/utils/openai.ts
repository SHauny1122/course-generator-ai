import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo, in production we should use server-side calls
});

export const generateCourseOutline = async (topic: string, audience: string, duration: string) => {
  const prompt = `Create a detailed course outline for:
  Topic: ${topic}
  Target Audience: ${audience}
  Duration: ${duration}
  
  Format the response as a structured course outline with:
  - Course Overview
  - Learning Objectives
  - Modules (with lessons under each)
  - Suggested exercises
  
  Keep it practical and focused.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert course designer who creates well-structured, practical course outlines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating course outline:', error);
    throw error;
  }
};

export const generateLesson = async (moduleTitle: string, lessonTitle: string) => {
  const prompt = `Create a detailed lesson plan for:
Module: ${moduleTitle}
Lesson: ${lessonTitle}

Please structure the lesson with:
1. Learning Objectives
2. Prerequisites
3. Key Concepts
4. Detailed Explanation
5. Code Examples (if applicable)
6. Practice Exercises
7. Common Pitfalls
8. Best Practices
9. Additional Resources

Make it comprehensive but easy to understand for the target audience.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert instructor who creates clear, comprehensive lesson plans."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw error;
  }
};

export const generateQuiz = async (topic: string, difficulty: string, questionTypes: { mcq: number; fill: number; tf: number; short: number }) => {
  const prompt = `Generate a quiz on ${topic} for a ${difficulty} level student.
  The quiz should include:
  - ${questionTypes.mcq} multiple-choice questions (with 4 options, correct answer marked)
  - ${questionTypes.fill} fill-in-the-blank questions
  - ${questionTypes.tf} true/false questions
  - ${questionTypes.short} short-answer questions

  Format each type clearly, with answers provided at the end.
  
  Use this exact format:
  Multiple Choice Questions:
  1. [Question]
     A) Option 1
     B) Option 2
     C) Option 3
     D) Option 4
     **Answer:** [Correct Option]

  Fill in the Blank:
  1. [Question with _____ for blank]
     **Answer:** [Correct Answer]

  True/False:
  1. [Statement]
     **Answer:** [True/False]

  Short Answer:
  1. [Question]
     **Answer:** [Brief answer]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz creator who generates clear, well-structured educational quizzes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};
