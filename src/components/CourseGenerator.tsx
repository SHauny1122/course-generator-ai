import { useState } from 'react';
import { generateCourseOutline } from '../utils/openai';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabaseClient';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  refreshCourses: () => void;
}

const CourseGenerator = ({ onClose, onSuccess, refreshCourses }: Props) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('beginner');
  const [duration, setDuration] = useState('1 week');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const { canUse, incrementUsage } = useSubscriptionContext();

  const handleGenerateCourse = async () => {
    if (!title.trim()) {
      setError('Please enter a course title');
      return;
    }

    if (!canUse('courses')) {
      setError('You have reached your course limit. Please upgrade your plan.');
      return;
    }

    if (!canUse('tokens')) {
      setError('You have reached your token limit. Please upgrade your plan to continue generating content.');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      // Generate course outline
      const courseStructure = await generateCourseOutline(
        topic || title,
        audience,
        duration
      );

      if (!courseStructure) {
        throw new Error('Failed to generate course outline');
      }

      // Create the course in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseStructure.title,
          content: JSON.stringify({
            ...courseStructure,
            topic,
            targetAudience: audience,
            courseDuration: duration
          }),
          user_id: user.id,
          shared: false,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      await incrementUsage('courses');
      onSuccess();
      refreshCourses();
      onClose();
    } catch (error) {
      console.error('Error generating course:', error);
      setError('Failed to generate course. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-4 text-white">Generate New Course</h2>
        
        {generating ? (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center">
            <LoadingSpinner text="Generating course content..." />
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Course Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
                placeholder="e.g., Flutter development"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Topic:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="e.g., Flutter development"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Target Audience:</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">Duration:</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              >
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="4 weeks">4 Weeks</option>
                <option value="6 weeks">6 Weeks</option>
                <option value="8 weeks">8 Weeks</option>
                <option value="12 weeks">12 Weeks</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={handleGenerateCourse}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default CourseGenerator;
