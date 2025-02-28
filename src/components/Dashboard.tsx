import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import CourseGenerator from './CourseGenerator';
import QuizGenerator from './QuizGenerator';
import QuizDisplay from './QuizDisplay';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import LessonGenerator from './LessonGenerator';
import '../styles/animations.css';

interface Course {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

interface CourseContent {
  title: string;
  description: string;
  modules: {
    title: string;
    description: string;
    lessons: {
      lesson_title: string;
      description: string;
    }[];
  }[];
}

interface Lesson {
  id: string;
  user_id: string;
  module_title: string;
  lesson_title: string;
  content: string;
  created_at: string;
}

interface Quiz {
  id: string;
  user_id: string;
  topic: string;
  difficulty: string;
  content: string;
  created_at: string;
}

interface UsageStats {
  tokens_used: number;
  courses_used: number;
  quizzes_used: number;
  lessons_used: number;
  tier: SubscriptionTier;
}

type SubscriptionTier = 'free' | 'basic' | 'pro';

const LIMITS = {
  free: {
    tokens: 5000,
    courses: 5,
    quizzes: 10,
    lessons: 15
  },
  basic: {
    tokens: 15000,
    courses: 15,
    quizzes: 30,
    lessons: 45
  },
  pro: {
    tokens: Infinity,
    courses: Infinity,
    quizzes: Infinity,
    lessons: Infinity
  }
};

function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [email, setEmail] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<CourseContent | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonGenerator, setShowLessonGenerator] = useState<{moduleTitle: string, lessonTitle: string} | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  const navigate = useNavigate();
  const subscriptionContext = useSubscriptionContext();

  useEffect(() => {
    fetchCourses();
    fetchLessons();
    fetchQuizzes();
    fetchUsageStats();
  }, []);

  const fetchUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setEmail(user.email);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (courses) setCourses(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (lessons) setLessons(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchUsageStats = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (error) {
      console.error('Error fetching usage stats:', error);
      return;
    }

    if (data) {
      setUsageStats({
        tokens_used: data.tokens_used || 0,
        courses_used: data.courses_used || 0,
        quizzes_used: data.quizzes_used || 0,
        lessons_used: data.lessons_used || 0,
        tier: data.tier,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGenerateCourse = (_course: CourseContent) => {
    fetchCourses();
    fetchUsageStats();
  };

  return (
    <div className="min-h-screen bg-[#1A1F2E] text-white">
      <header className="p-4 backdrop-blur-lg bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow">Course</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-glow">Gen</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGenerator(true)}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300
                bg-gradient-to-r from-purple-600 to-blue-600
                hover:from-purple-500 hover:to-blue-400
                shadow-[0_0_10px_rgba(147,51,234,0.3)]
                hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
            >
              Generate Course
            </button>
            <button
              onClick={() => setShowQuizGenerator(true)}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300
                bg-gradient-to-r from-purple-600 to-blue-600
                hover:from-purple-500 hover:to-blue-400
                shadow-[0_0_10px_rgba(147,51,234,0.3)]
                hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
            >
              Generate Quiz
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">{email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {usageStats && usageStats.tier === 'free' && (
          <div className="container mx-auto mb-8">
            <div className="bg-gradient-to-br from-[#2A2F4E] to-[#1E293B] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Free Tier Usage</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tokens Usage */}
                <div className="bg-[#1E293B]/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Tokens Used</span>
                    <span className="text-sm text-gray-400">{usageStats.tokens_used} / {LIMITS.free.tokens}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((usageStats.tokens_used / LIMITS.free.tokens) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Courses Usage */}
                <div className="bg-[#1E293B]/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Courses Created</span>
                    <span className="text-sm text-gray-400">{usageStats.courses_used} / {LIMITS.free.courses}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((usageStats.courses_used / LIMITS.free.courses) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quizzes Usage */}
                <div className="bg-[#1E293B]/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Quizzes Created</span>
                    <span className="text-sm text-gray-400">{usageStats.quizzes_used} / {LIMITS.free.quizzes}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((usageStats.quizzes_used / LIMITS.free.quizzes) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Lessons Usage */}
                <div className="bg-[#1E293B]/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Lessons Created</span>
                    <span className="text-sm text-gray-400">{usageStats.lessons_used} / {LIMITS.free.lessons}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((usageStats.lessons_used / LIMITS.free.lessons) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Your Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const content = JSON.parse(course.content) as CourseContent;
              return (
                <div
                  key={course.id}
                  className="bg-gradient-to-br from-[#2A2F4E] to-[#1E293B] rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-xl font-bold mb-4">{content.title}</h3>
                  <p className="text-gray-300 mb-6">{content.description}</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCourse(content)}
                        className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300
                          bg-gradient-to-r from-purple-600 to-blue-600
                          hover:from-purple-500 hover:to-blue-400
                          shadow-[0_0_10px_rgba(147,51,234,0.3)]
                          hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]
                          text-sm"
                      >
                        View Course
                      </button>
                      <button
                        onClick={() => {
                          // Format course content as plain text
                          const text = `${content.title}\n\n${content.description}\n\n${content.modules
                            .map(
                              (module) =>
                                `${module.title}\n${module.description || ''}\n\n${module.lessons
                                  .map((lesson) => `${lesson.lesson_title}\n${lesson.description || ''}`)
                                  .join('\n\n')}`
                            )
                            .join('\n\n')}`;
                          
                          // Download as text file
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${content.title}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300
                          bg-gradient-to-r from-blue-600 to-blue-500
                          hover:from-blue-500 hover:to-blue-400
                          shadow-[0_0_10px_rgba(59,130,246,0.3)]
                          hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]
                          text-sm"
                      >
                        Download
                      </button>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(course.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="container mx-auto mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative group bg-[#1E293B] rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">{quiz.topic}</h3>
                <p className="text-gray-400 mb-2">Difficulty: {quiz.difficulty}</p>
                <p className="text-gray-400 mb-4 text-sm">Created on {new Date(quiz.created_at).toLocaleDateString()}</p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuiz(quiz);
                    }}
                    className="px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300
                      bg-gradient-to-r from-purple-600 to-blue-600
                      hover:from-purple-500 hover:to-blue-400
                      shadow-[0_0_10px_rgba(147,51,234,0.3)]
                      hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                  >
                    View Quiz
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download functionality will be added
                    }}
                    className="px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300
                      bg-gradient-to-r from-blue-600 to-purple-600
                      hover:from-blue-500 hover:to-purple-400
                      shadow-[0_0_10px_rgba(147,51,234,0.3)]
                      hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                  >
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="container mx-auto mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-gradient-to-br from-[#2A2F4E] to-[#1E293B] rounded-lg p-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
              >
                {/* Purple glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Book icon */}
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.806 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H6c-.499 0-.999.077-1.479.231-.271-.393-.421-.851-.421-1.231 0-1.103.897-2 2-2h12.875L19 13V2l1 1v13zm-2-7H8V7h9v2zm0 4H8v-2h9v2z" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{lesson.lesson_title}</h3>
                      <p className="text-purple-300/80 text-xs mb-2">Module: {lesson.module_title}</p>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none mb-4">
                    <div className="line-clamp-2 text-sm text-gray-300/80">{lesson.content}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedLesson(lesson)}
                        className="px-3 py-1.5 rounded text-white font-medium transition-all duration-300
                          bg-gradient-to-r from-purple-600 to-blue-600
                          hover:from-purple-500 hover:to-blue-400
                          shadow-[0_0_10px_rgba(147,51,234,0.3)]
                          hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]
                          text-xs"
                      >
                        View Lesson
                      </button>
                      <button
                        onClick={() => {
                          // Download lesson as text file
                          const text = `${lesson.lesson_title}\n\nModule: ${lesson.module_title}\n\n${lesson.content}`;
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${lesson.lesson_title}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1.5 rounded text-white font-medium transition-all duration-300
                          bg-gradient-to-r from-blue-600 to-blue-500
                          hover:from-blue-500 hover:to-blue-400
                          shadow-[0_0_10px_rgba(59,130,246,0.3)]
                          hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]
                          text-xs"
                      >
                        Download
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(lesson.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <CourseGenerator
              onClose={() => setShowGenerator(false)}
              onGenerate={handleGenerateCourse}
            />
          </div>
        </div>
      )}

      {/* Quiz Generator Modal */}
      {showQuizGenerator && (
        <QuizGenerator
          onClose={() => setShowQuizGenerator(false)}
          onSuccess={() => {
            setShowQuizGenerator(false);
            fetchQuizzes();
            fetchUsageStats();
          }}
          refreshQuizzes={fetchQuizzes}
        />
      )}

      {/* Quiz Display Modal */}
      {selectedQuiz && (
        <QuizDisplay
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onDelete={() => {
            setSelectedQuiz(null);
            fetchQuizzes();
            fetchUsageStats();
          }}
        />
      )}

      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl bg-[#1E293B] rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedCourse.title}</h2>
            <p className="text-gray-300 mb-8">{selectedCourse.description}</p>
            <div className="space-y-6">
              {selectedCourse.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="bg-black/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{module.title}</h3>
                    <button
                      onClick={() => setShowLessonGenerator({
                        moduleTitle: module.title,
                        lessonTitle: `Lesson on ${module.title}`
                      })}
                      className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300
                        bg-gradient-to-r from-purple-600 to-blue-600
                        hover:from-purple-500 hover:to-blue-400
                        shadow-[0_0_10px_rgba(147,51,234,0.3)]
                        hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]
                        text-sm"
                    >
                      Generate Lesson
                    </button>
                  </div>
                  {module.description && (
                    <p className="text-gray-300 mb-4">{module.description}</p>
                  )}
                  <div className="space-y-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold mb-2">{lesson.lesson_title}</h4>
                        {lesson.description && (
                          <p className="text-gray-300">{lesson.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedLesson.lesson_title}</h2>
                <p className="text-purple-300/80">Module: {selectedLesson.module_title}</p>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              {selectedLesson.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLessonGenerator && (
        <LessonGenerator
          moduleTitle={showLessonGenerator.moduleTitle}
          lessonTitle={showLessonGenerator.lessonTitle}
          onClose={() => setShowLessonGenerator(null)}
          refreshLessons={fetchLessons}
        />
      )}
    </div>
  );
}

export default Dashboard;
