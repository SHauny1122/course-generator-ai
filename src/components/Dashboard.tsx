import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { exportCourseToText, exportQuizToText } from '../utils/textExporter';
import { useNavigate } from 'react-router-dom';
import CourseGenerator from './CourseGenerator';
import QuizGenerator from './QuizGenerator';
import LessonGenerator from './LessonGenerator';
import QuizDisplay from './QuizDisplay';
import { Session } from '@supabase/supabase-js';

interface Course {
  id: string;
  title: string;
  content: string;
  shared?: boolean;
  share_url?: string;
}

interface Lesson {
  id: string;
  user_id: string;
  module_title: string;
  lesson_title: string;
  content: string;
  created_at?: string;
}

interface CourseContent {
  title: string;
  description: string;
  modules: {
    title: string;
    description?: string;
    lessons: {
      title: string;
      description?: string;
    }[];
  }[];
}

interface CourseCardProps {
  course: Course;
  onDelete: (id: string) => void;
  onClick: () => void;
}

interface DashboardProps {
  session: Session;
}

const CourseCard = ({ course, onDelete, onClick }: CourseCardProps) => {
  let courseContent: CourseContent | null = null;

  try {
    courseContent = JSON.parse(course.content);
  } catch (error) {
    console.error('Error parsing course content:', error);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#252525] p-6 rounded-xl shadow-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{courseContent?.title}</h3>
        <div className="prose prose-invert max-w-none text-sm line-clamp-3">
          <ReactMarkdown>{courseContent?.description || ''}</ReactMarkdown>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            exportCourseToText(course);
          }}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          Download
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(course.id);
          }}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

const CourseView = ({ 
  course, 
  onClose,
  onGenerateLesson 
}: { 
  course: Course; 
  onClose: () => void;
  onGenerateLesson: (moduleTitle: string, lessonTitle: string) => void;
}) => {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  let courseContent: CourseContent;

  try {
    courseContent = JSON.parse(course.content);
  } catch (error) {
    console.error('Error parsing course content:', error);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{courseContent.title}</h1>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-[#252525] p-6 rounded-xl shadow-lg">
          <div className="prose prose-invert max-w-none mb-6">
            <ReactMarkdown>{courseContent.description}</ReactMarkdown>
          </div>

          <div className="space-y-4">
            {courseContent.modules.map((module, moduleIndex) => (
              <div
                key={moduleIndex}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700"
                  onClick={() => setSelectedModule(selectedModule === moduleIndex ? null : moduleIndex)}
                >
                  <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      selectedModule === moduleIndex ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {selectedModule === moduleIndex && (
                  <div className="p-4 bg-gray-700">
                    {module.description && (
                      <p className="text-gray-300 mb-4">{module.description}</p>
                    )}
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className="flex items-center justify-between p-2 rounded bg-gray-600"
                        >
                          <span className="text-white">{lesson.title}</span>
                          <button
                            onClick={() => onGenerateLesson(module.title, lesson.title)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Generate Lesson
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => exportCourseToText(course)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download Course
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ session }: DashboardProps) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showLessonGenerator, setShowLessonGenerator] = useState(false);
  const [selectedLessonInfo, setSelectedLessonInfo] = useState<{
    moduleTitle: string;
    lessonTitle: string;
  } | null>(null);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const navigate = useNavigate();

  // Check authentication and fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserEmail(user.email || null);
      await Promise.all([fetchSavedCourses(), fetchSavedQuizzes(), fetchSavedLessons()]);
    };

    fetchInitialData();
  }, []);

  const handleGenerateLesson = (moduleTitle: string, lessonTitle: string) => {
    setSelectedLessonInfo({
      moduleTitle,
      lessonTitle
    });
    setShowLessonGenerator(true);
  };

  const fetchSavedCourses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }

    setSavedCourses(courses || []);
  };

  const fetchSavedQuizzes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quizzes:', error);
      return;
    }

    setSavedQuizzes(quizzes || []);
  };

  const fetchSavedLessons = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lessons:', error);
      return;
    }

    setSavedLessons(lessons || []);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      await fetchSavedCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return;
    }
    navigate('/login');
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      await fetchSavedLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson. Please try again.');
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-8">
        <span className="text-gray-400">{userEmail}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  };

  const renderQuizzes = () => (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Your Quizzes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedQuizzes.length === 0 ? (
          <div className="text-gray-400">No quizzes yet. Create your first quiz!</div>
        ) : (
          savedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => setSelectedQuiz(quiz)}
              className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{quiz.topic}</h3>
              <p className="text-gray-400">Difficulty: {quiz.difficulty}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportQuizToText(quiz);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuiz(quiz.id);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      await fetchSavedQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  const renderLessons = () => (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Your Lessons</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedLessons.length === 0 ? (
          <div className="text-gray-400">No lessons yet. Generate your first lesson!</div>
        ) : (
          savedLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#252525] p-6 rounded-xl shadow-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{lesson.lesson_title}</h3>
                <p className="text-gray-400 text-sm mb-2">Module: {lesson.module_title}</p>
                <div className="prose prose-invert max-w-none text-sm line-clamp-3">
                  <ReactMarkdown>{lesson.content}</ReactMarkdown>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([lesson.content], {type: 'text/markdown'});
                    element.href = URL.createObjectURL(file);
                    element.download = `${lesson.module_title}-${lesson.lesson_title}.md`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  if (showGenerator) {
    return (
      <CourseGenerator 
        onClose={() => setShowGenerator(false)}
        onSuccess={() => {
          setShowGenerator(false);
          fetchSavedCourses();
        }}
        refreshCourses={fetchSavedCourses}
      />
    );
  }

  if (showQuizGenerator) {
    return (
      <QuizGenerator
        onClose={() => setShowQuizGenerator(false)}
        onSuccess={() => {
          setShowQuizGenerator(false);
          fetchSavedQuizzes();
        }}
        refreshQuizzes={fetchSavedQuizzes}
      />
    );
  }

  if (showLessonGenerator && selectedLessonInfo) {
    return (
      <LessonGenerator
        moduleTitle={selectedLessonInfo.moduleTitle}
        lessonTitle={selectedLessonInfo.lessonTitle}
        onClose={() => {
          setShowLessonGenerator(false);
          setSelectedLessonInfo(null);
        }}
        refreshLessons={fetchSavedLessons}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseView
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onGenerateLesson={handleGenerateLesson}
      />
    );
  }

  if (selectedQuiz) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <QuizDisplay 
          quiz={selectedQuiz} 
          onClose={() => setSelectedQuiz(null)}
          onDelete={() => handleDeleteQuiz(selectedQuiz.id)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {renderHeader()}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate New Course
          </button>
          <button
            onClick={() => setShowQuizGenerator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate New Quiz
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCourses.length === 0 ? (
              <div className="text-gray-400">No courses yet. Create your first course!</div>
            ) : (
              savedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDelete={handleDeleteCourse}
                  onClick={() => setSelectedCourse(course)}
                />
              ))
            )}
          </div>
        </div>

        {renderLessons()}
        {renderQuizzes()}
      </div>
    </div>
  );
};

export default Dashboard;
