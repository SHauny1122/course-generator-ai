import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { generateLesson } from '../utils/openai';
import { PDFDownloadButton } from '../utils/pdfGenerator';

interface LessonGeneratorProps {
  moduleTitle: string;
  lessonTitle: string;
  onClose: () => void;
  onSave?: () => void;
}

export default function LessonGenerator({ moduleTitle, lessonTitle, onClose, onSave }: LessonGeneratorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate lesson content when component mounts
  useEffect(() => {
    const generateContent = async () => {
      try {
        setLoading(true);
        const lessonContent = await generateLesson(moduleTitle, lessonTitle);
        setContent(lessonContent || '');
      } catch (error) {
        console.error('Error generating lesson:', error);
        setError('Failed to generate lesson content. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    generateContent();
  }, [moduleTitle, lessonTitle]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('lessons')
        .insert([
          {
            user_id: user.id,
            module_title: moduleTitle,
            lesson_title: lessonTitle,
            content: content
          }
        ]);

      if (error) throw error;
      setSaveSuccess(true);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{lessonTitle}</h2>
            <p className="text-gray-400">{moduleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-white mb-2">Generating lesson content...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 mt-4">{error}</div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !content}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Lesson'}
          </button>
          {content && (
            <PDFDownloadButton
              type="lesson"
              data={{
                title: lessonTitle,
                module: moduleTitle,
                content: content,
              }}
              fileName={`${lessonTitle.toLowerCase().replace(/\s+/g, '-')}`}
            />
          )}
        </div>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Lesson saved successfully!
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
