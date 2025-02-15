import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { generateCourseOutline } from '../utils/openai';
import LessonGenerator from './LessonGenerator';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';

interface CourseGeneratorProps {
  onClose?: () => void;
  onSave?: () => void;
}

export default function CourseGenerator({ onClose, onSave }: CourseGeneratorProps) {
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    duration: ''
  });
  const [courseOutline, setCourseOutline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLesson, setSelectedLesson] = useState({ title: '', module: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { canUse, updateUsage, getLimits, subscription } = useSubscriptionContext();
  const limits = getLimits();

  const generateCourse = async () => {
    if (!canUse('courses')) {
      alert('You have reached your monthly course limit. Please upgrade your plan to create more courses.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const outline = await generateCourseOutline(
        formData.topic,
        formData.audience,
        formData.duration
      );
      if (outline) {
        setCourseOutline(outline);
      } else {
        throw new Error('No outline generated');
      }
    } catch (error) {
      console.error('Error generating course:', error);
      setError('Failed to generate course. Please try again.');
    } finally {
      setLoading(false);
      await updateUsage('courses');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCourse();
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to save courses');
        return;
      }

      const { error } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          title: formData.topic,
          content: courseOutline,
          lessons: {}
        });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
      setError('Failed to save course. Please try again.');
    }
  };

  // Function to process the markdown content and add buttons
  const processMarkdown = (content: string) => {
    const lines = content.split('\n');
    let currentModule = '';
    
    return lines.map((line, index) => {
      // Check for Week headers
      if (line.match(/^Week \d+:/)) {
        currentModule = line;
        return <h3 key={index} className="text-xl font-semibold text-white mt-6 mb-3">{line}</h3>;
      }
      
      // Check for Module headers
      if (line.match(/^- Module \d+:/)) {
        return <h4 key={index} className="text-lg font-semibold text-white mt-4 mb-2">{line}</h4>;
      }
      
      // Check for bullet points that are actual lessons (not module titles)
      if (line.trim().startsWith('- ') && !line.includes('Module') && !line.includes('Suggested Exercises')) {
        const lessonTitle = line.trim().substring(2); // Remove the "- " prefix
        return (
          <div key={index} className="flex items-center justify-between py-2">
            <p className="text-gray-300">{lessonTitle}</p>
            <button
              onClick={() => setSelectedLesson({ 
                title: lessonTitle, 
                module: currentModule.split(':')[0].trim() 
              })}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ml-4"
            >
              Generate Lesson
            </button>
          </div>
        );
      }
      
      // For all other lines, render normally
      return <p key={index} className="text-gray-300">{line}</p>;
    });
  };

  const refreshLessons = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Create New Course</h1>
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
          <label className="block text-gray-300 mb-2">Course Topic</label>
          <input
            type="text"
            placeholder="e.g., Introduction to Python Programming"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full p-3 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Target Audience</label>
          <input
            type="text"
            placeholder="e.g., Complete beginners"
            value={formData.audience}
            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            className="w-full p-3 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Course Duration</label>
          <input
            type="text"
            placeholder="e.g., 6 weeks"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full p-3 bg-[#252525] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !canUse('courses')}
          className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ${
            !canUse('courses') ? 'bg-gray-400 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Generating Course Outline...' : 'Generate Course Outline'}
        </button>

        <div className="text-sm text-gray-500 mt-2">
          {subscription && `${limits.maxCourses - subscription.courses_used} courses remaining this month`}
        </div>

        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}

        {courseOutline && (
          <div className="mt-8">
            <div className="bg-[#252525] p-6 rounded-xl">
              <div className="prose prose-invert max-w-none">
                {processMarkdown(courseOutline)}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Course
              </button>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="fixed bottom-4 right-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              Course saved successfully!
            </motion.div>
          </div>
        )}
      </div>

      {selectedLesson.title && (
        <LessonGenerator
          moduleTitle={selectedLesson.module}
          lessonTitle={selectedLesson.title}
          onClose={() => setSelectedLesson({ title: '', module: '' })}
          onSave={refreshLessons}
        />
      )}
    </div>
  );
}
