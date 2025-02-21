// Course Types
export interface CourseStructure {
  title: string;
  overview: string;
  objectives: string[];
  modules: {
    title: string;
    lessons: {
      title: string;
      description: string;
    }[];
  }[];
}

// Quiz Types
export interface QuizStructure {
  title: string;
  difficulty: string;
  multipleChoice: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  fillInBlanks: {
    question: string;
    answer: string;
  }[];
  trueFalse: {
    statement: string;
    answer: boolean;
  }[];
  shortAnswer: {
    question: string;
    answer: string;
  }[];
}

// Lesson Types
export interface LessonStructure {
  title: string;
  moduleTitle: string;
  objectives: string[];
  keyConcepts: string[];
  explanation: string;
  examples: string[];
  exercises: {
    description: string;
    solution?: string;
  }[];
  summary: string;
}

// OpenAI Function Schemas
export const courseSchema = {
  name: "generateCourseStructure",
  description: "Generate a structured course outline with modules and lessons",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The title of the course"
      },
      overview: {
        type: "string",
        description: "A comprehensive overview of the course"
      },
      objectives: {
        type: "array",
        items: { type: "string" },
        description: "List of learning objectives for the course"
      },
      modules: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the module"
            },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Title of the lesson"
                  },
                  description: {
                    type: "string",
                    description: "Brief description of the lesson content"
                  }
                },
                required: ["title", "description"]
              }
            }
          },
          required: ["title", "lessons"]
        }
      }
    },
    required: ["title", "overview", "objectives", "modules"]
  }
};

export const quizSchema = {
  name: "generateQuizStructure",
  description: "Generate a structured quiz with different types of questions",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The title of the quiz"
      },
      difficulty: {
        type: "string",
        description: "The difficulty level of the quiz"
      },
      multipleChoice: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "The multiple choice question"
            },
            options: {
              type: "array",
              items: { type: "string" },
              description: "Array of 4 possible answers"
            },
            correctAnswer: {
              type: "string",
              description: "The correct answer from the options"
            }
          },
          required: ["question", "options", "correctAnswer"]
        }
      },
      fillInBlanks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "Question with blank space indicated by _____"
            },
            answer: {
              type: "string",
              description: "The correct answer for the blank"
            }
          },
          required: ["question", "answer"]
        }
      },
      trueFalse: {
        type: "array",
        items: {
          type: "object",
          properties: {
            statement: {
              type: "string",
              description: "A statement that is either true or false"
            },
            answer: {
              type: "boolean",
              description: "Whether the statement is true or false"
            }
          },
          required: ["statement", "answer"]
        }
      },
      shortAnswer: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "Short answer question"
            },
            answer: {
              type: "string",
              description: "The expected answer"
            }
          },
          required: ["question", "answer"]
        }
      }
    },
    required: ["title", "difficulty", "multipleChoice", "fillInBlanks", "trueFalse", "shortAnswer"]
  }
};

export const lessonSchema = {
  name: "generateLessonStructure",
  description: "Generate a structured lesson plan",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The title of the lesson"
      },
      moduleTitle: {
        type: "string",
        description: "The title of the module this lesson belongs to"
      },
      objectives: {
        type: "array",
        items: { type: "string" },
        description: "List of learning objectives for this lesson"
      },
      keyConcepts: {
        type: "array",
        items: { type: "string" },
        description: "List of key concepts covered in the lesson"
      },
      explanation: {
        type: "string",
        description: "Detailed explanation of the lesson content"
      },
      examples: {
        type: "array",
        items: { type: "string" },
        description: "List of examples illustrating the concepts"
      },
      exercises: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Description of the exercise"
            },
            solution: {
              type: "string",
              description: "Optional solution or guidance for the exercise"
            }
          },
          required: ["description"]
        }
      },
      summary: {
        type: "string",
        description: "A concise summary of the lesson"
      }
    },
    required: ["title", "moduleTitle", "objectives", "keyConcepts", "explanation", "examples", "exercises", "summary"]
  }
};
