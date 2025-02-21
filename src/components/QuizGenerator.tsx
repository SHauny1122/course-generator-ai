import { useState } from 'react';
import { generateQuiz } from '../utils/openai';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabaseClient';
import { QuizStructure } from '../types/schemas';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  refreshQuizzes: () => void;
}

const QuizGenerator = ({ onClose, onSuccess, refreshQuizzes }: Props) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [questionCounts, setQuestionCounts] = useState({
    mcq: 0,
    fill: 0,
    tf: 10,
    short: 0
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const { canUse, incrementUsage } = useSubscriptionContext();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (!canUse('quizzes')) {
      setError('You have reached your monthly quiz limit. Please upgrade your plan.');
      return;
    }

    if (!canUse('tokens')) {
      setError('You have reached your token limit. Please upgrade your plan to continue generating content.');
      return;
    }

    const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0);
    if (totalQuestions === 0) {
      setError('Please specify at least one question type');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      const quizStructure = await generateQuiz(topic, difficulty, questionCounts);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: quizError } = await supabase
        .from('quizzes')
        .insert({
          topic,
          difficulty,
          content: JSON.stringify(quizStructure),
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (quizError) throw quizError;

      await incrementUsage('quizzes');
      refreshQuizzes();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Generate New Quiz</h2>
        
        {generating ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white">Generating quiz content...</p>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Topic:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="e.g., Flutter development"
                required
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-semibold">Question Types:</h3>
              
              <div>
                <label className="block text-white mb-1">Multiple Choice:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={questionCounts.mcq}
                  onChange={(e) => setQuestionCounts(prev => ({ ...prev, mcq: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-1">Fill in the Blanks:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={questionCounts.fill}
                  onChange={(e) => setQuestionCounts(prev => ({ ...prev, fill: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-1">True/False:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={questionCounts.tf}
                  onChange={(e) => setQuestionCounts(prev => ({ ...prev, tf: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-1">Short Answer:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={questionCounts.short}
                  onChange={(e) => setQuestionCounts(prev => ({ ...prev, short: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuizGenerator;
