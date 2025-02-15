import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { generateQuiz } from '../utils/openai';
import { PDFDownloadButton } from '../utils/pdfGenerator';

interface QuizGeneratorProps {
  onClose?: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  title: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export default function QuizGenerator({ onClose }: QuizGeneratorProps) {
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'beginner',
    questionTypes: {
      mcq: 5,
      fill: 2,
      tf: 2,
      short: 1
    }
  });
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const generatedQuiz = await generateQuiz(
        formData.topic,
        formData.difficulty,
        formData.questionTypes
      );
      setQuiz(generatedQuiz || null);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('quizzes')
        .insert([
          {
            user_id: user.id,
            topic: formData.topic,
            difficulty: formData.difficulty,
            content: quiz
          }
        ]);

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quiz ? JSON.stringify(quiz) : '');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Create New Quiz</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Dashboard
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Quiz Topic</label>
          <input
            type="text"
            placeholder="e.g., Basic Algebra"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full p-3 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Difficulty Level</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full p-3 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-4">Question Types</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Multiple Choice</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.questionTypes.mcq}
                onChange={(e) => setFormData({
                  ...formData,
                  questionTypes: {
                    ...formData.questionTypes,
                    mcq: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Fill in the Blank</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.questionTypes.fill}
                onChange={(e) => setFormData({
                  ...formData,
                  questionTypes: {
                    ...formData.questionTypes,
                    fill: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">True/False</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.questionTypes.tf}
                onChange={(e) => setFormData({
                  ...formData,
                  questionTypes: {
                    ...formData.questionTypes,
                    tf: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Short Answer</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.questionTypes.short}
                onChange={(e) => setFormData({
                  ...formData,
                  questionTypes: {
                    ...formData.questionTypes,
                    short: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !formData.topic}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>

        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}

        {quiz && (
          <div className="mt-8">
            <div className="bg-[#252525] p-6 rounded-xl">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{JSON.stringify(quiz, null, 2)}</ReactMarkdown>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Quiz
              </button>
              {quiz && quiz.questions && quiz.questions.length > 0 && (
                <PDFDownloadButton
                  type="quiz"
                  data={{
                    title: quiz.title,
                    difficulty: quiz.difficulty,
                    questions: quiz.questions.map(q => ({
                      question: q.question,
                      options: q.options,
                      answer: q.answer,
                    })),
                  }}
                  fileName={`${quiz.title.toLowerCase().replace(/\s+/g, '-')}`}
                />
              )}
            </div>
          </div>
        )}

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Quiz saved successfully!
          </motion.div>
        )}
      </div>
    </div>
  );
}
