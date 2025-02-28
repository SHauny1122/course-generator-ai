import { useState } from 'react';
import { generateCourseOutline } from '../utils/openai';
import { supabase } from '../lib/supabaseClient';
import LoadingSpinner from './LoadingSpinner';
import { checkFreeTierLimits } from '../utils/openai';

interface Props {
  onClose: () => void;
  onGenerate: (course: any) => void;
}

const CourseGenerator = ({ onClose, onGenerate }: Props) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('beginner');
  const [duration, setDuration] = useState('1 week');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerateCourse = async () => {
    if (!topic || !audience || !duration) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Check if user has enough tokens and course slots
      const [canUseTokens, canCreateCourse] = await Promise.all([
        checkFreeTierLimits('token', 0), // We'll check actual usage after generation
        checkFreeTierLimits('course', 1)
      ]);

      if (!canUseTokens) {
        setError('You have reached your monthly token limit. Please upgrade to continue generating content.');
        return;
      }

      if (!canCreateCourse) {
        setError('You have reached your monthly course limit. Please upgrade to create more courses.');
        return;
      }

      setGenerating(true);
      setError('');

      const course = await generateCourseOutline(topic, audience, duration);
      
      if (!course) {
        throw new Error('Failed to generate course outline');
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Save the course
      const { error: saveError } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          title: topic,
          content: JSON.stringify(course),
          shared: false
        });

      if (saveError) throw saveError;

      if (onGenerate) {
        onGenerate(course);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E1E1E] rounded-xl border border-white/10 w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Generate New Course</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Flutter Development"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Mobile App Development"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="4 weeks">4 Weeks</option>
                <option value="8 weeks">8 Weeks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4 bg-black/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={generating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateCourse}
            disabled={generating}
            className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-300
              bg-gradient-to-r from-purple-600 to-blue-600
              hover:from-purple-700 hover:to-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {generating ? (
              <>
                <LoadingSpinner size={5} />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseGenerator;
