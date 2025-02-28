import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { generateLesson } from '../utils/openai';
import { PDFDownloadButton } from '../utils/pdfGenerator';
import LoadingSpinner from './LoadingSpinner';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { checkFreeTierLimits } from '../utils/openai';

interface LessonGeneratorProps {
  moduleTitle: string;
  lessonTitle: string;
  onClose: () => void;
  refreshLessons: () => void;
}

export default function LessonGenerator({ moduleTitle, lessonTitle, onClose, refreshLessons }: LessonGeneratorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { canUse, incrementUsage } = useSubscriptionContext();

  const handleGenerateLesson = async () => {
    if (!moduleTitle.trim() || !lessonTitle.trim()) {
      setError('Please enter both module and lesson titles');
      return;
    }

    if (!canUse('lessons')) {
      setError('You have reached your lesson limit. Please upgrade your plan.');
      return;
    }

    try {
      // Check if user has enough tokens
      const canUseTokens = await checkFreeTierLimits('token', 0); // We'll check actual usage after generation
      if (!canUseTokens) {
        setError('You have reached your monthly token limit. Please upgrade to continue generating content.');
        return;
      }

      setLoading(true);
      setError('');
      setSaveSuccess(false);

      const lessonContent = await generateLesson(moduleTitle, lessonTitle);
      if (!lessonContent) {
        throw new Error('Failed to generate lesson content');
      }

      // Format the lesson content as markdown
      const markdownContent = `
# ${lessonTitle}

## Learning Objectives
${lessonContent.objectives.map(obj => `- ${obj}`).join('\n')}

## Key Concepts
${lessonContent.keyConcepts.map(concept => `- ${concept}`).join('\n')}

## Explanation
${lessonContent.explanation}

## Examples
${lessonContent.examples.map((example, index) => `### Example ${index + 1}\n${example}`).join('\n\n')}

## Exercises
${lessonContent.exercises.map((exercise, index) => `
### Exercise ${index + 1}
${exercise.description}
${exercise.solution ? `\n**Solution:**\n${exercise.solution}` : ''}`).join('\n\n')}

## Summary
${lessonContent.summary}
`;

      setContent(markdownContent);
    } catch (error) {
      console.error('Error generating lesson:', error);
      setError('Failed to generate lesson content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Increment lesson usage before saving
      await incrementUsage('lessons');

      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          user_id: user.id,
          module_title: moduleTitle,
          lesson_title: lessonTitle,
          content: content
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);

      // Refresh lessons list and close
      refreshLessons();
      onClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateLesson();
  }, [moduleTitle, lessonTitle]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{lessonTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner text="Generating lesson content..." />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <PDFDownloadButton
                content={content}
                title={`${moduleTitle} - ${lessonTitle}`}
              >
                Download PDF
              </PDFDownloadButton>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-4 py-2 rounded ${
                  saveSuccess
                    ? 'bg-green-500'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white font-medium transition-colors`}
              >
                {saveSuccess ? 'Saved!' : 'Save Lesson'}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
