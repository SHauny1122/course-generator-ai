import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import CourseGenerator from './CourseGenerator';
import QuizGenerator from './QuizGenerator';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Course } from '../types/course';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';

interface Lesson {
  id: string;
  module_title: string;
  lesson_title: string;
  content: string;
}

export default function Dashboard() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const { subscription, loading: subscriptionLoading } = useSubscriptionContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpgradeClick = () => {
    console.log('Upgrade button clicked');
    navigate('/learn-more', { state: { isUpgrading: true } });
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
      
      // Only fetch data, don't redirect based on subscription
      fetchSavedCourses();
      fetchSavedLessons();
      fetchSavedQuizzes();
    } else {
      navigate('/');
    }
  };

  // Add subscription check effect
  useEffect(() => {
    if (!subscriptionLoading && !subscription) {
      navigate('/learn-more');
    }
  }, [subscription, subscriptionLoading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchSavedCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedLessons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchSavedQuizzes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const exportToPDF = async (course: Course) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px;">
          <h1>${course.title}</h1>
          <div>${course.content}</div>
        </div>
      `;
      document.body.appendChild(element);

      const canvas = await html2canvas(element);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
      pdf.save(`${course.title}.pdf`);

      document.body.removeChild(element);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const exportLessonToPDF = async (lesson: Lesson) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px;">
          <h1>${lesson.lesson_title}</h1>
          <h2>Module: ${lesson.module_title}</h2>
          <div>${lesson.content}</div>
        </div>
      `;
      document.body.appendChild(element);

      const canvas = await html2canvas(element);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
      pdf.save(`${lesson.lesson_title}.pdf`);

      document.body.removeChild(element);
    } catch (error) {
      console.error('Error exporting lesson to PDF:', error);
    }
  };

  const exportQuizToPDF = async (quiz: any) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px;">
          <h1>${quiz.title}</h1>
          <h2>Difficulty: ${quiz.difficulty}</h2>
          <div>
            ${quiz.content}
          </div>
        </div>
      `;
      document.body.appendChild(element);

      const canvas = await html2canvas(element);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
      pdf.save(`${quiz.title}.pdf`);

      document.body.removeChild(element);
    } catch (error) {
      console.error('Error exporting quiz to PDF:', error);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      
      // Update local state to remove the deleted course
      setSavedCourses(savedCourses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      
      // Update local state to remove the deleted lesson
      setSavedLessons(savedLessons.filter(lesson => lesson.id !== lessonId));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      
      // Update local state to remove the deleted quiz
      setSavedQuizzes(savedQuizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const shareCourse = async (course: Course) => {
    try {
      await navigator.clipboard.writeText(
        `Check out this course: ${course.title}\n\n${course.content}`
      );
      alert('Course content copied to clipboard! You can now share it.');
    } catch (error) {
      console.error('Error sharing course:', error);
    }
  };

  const refreshLessons = () => {
    fetchSavedLessons();
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-8 bg-[#252525] p-4 rounded-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        {!subscriptionLoading && subscription && (
          <p className="text-gray-400 mt-1">
            Plan: <span className="capitalize">{subscription.tier}</span>
            {subscription.tier !== 'pro' && (
              <button
                onClick={handleUpgradeClick}
                className="ml-4 text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-400">{userEmail}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  if (showGenerator) {
    return <CourseGenerator 
      onClose={() => {
        setShowGenerator(false);
        fetchSavedCourses();
      }}
      onSave={fetchSavedLessons}
    />;
  }

  if (showQuizGenerator) {
    return <QuizGenerator onClose={() => {
      setShowQuizGenerator(false);
      fetchSavedQuizzes();
    }} />;
  }

  if (selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{selectedLesson.lesson_title}</h1>
            <p className="text-gray-400">{selectedLesson.module_title}</p>
          </div>
          <button
            onClick={() => {
              setSelectedLesson(null);
              refreshLessons(); // Refresh lessons when going back
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="bg-[#252525] p-6 rounded-xl shadow-lg">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            exportLessonToPDF(selectedLesson);
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export PDF
        </button>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{selectedCourse.title}</h1>
          <button
            onClick={() => setSelectedCourse(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="bg-[#252525] p-6 rounded-xl shadow-lg">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{selectedCourse.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{selectedQuiz.title}</h1>
          <button
            onClick={() => setSelectedQuiz(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="bg-[#252525] p-6 rounded-xl shadow-lg">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{selectedQuiz.content}</ReactMarkdown>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            exportQuizToPDF(selectedQuiz);
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export PDF
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] p-6">
      {renderHeader()}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Course
          </button>
          <button
            onClick={() => setShowQuizGenerator(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create New Quiz
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="text-gray-400">Loading your courses...</div>
            ) : savedCourses.length === 0 ? (
              <div className="text-gray-400">No courses yet. Create your first course!</div>
            ) : (
              savedCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#252525] p-6 rounded-xl shadow-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="cursor-pointer" onClick={() => setSelectedCourse(course)}>
                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                    <div className="prose prose-invert max-w-none text-sm line-clamp-3">
                      <ReactMarkdown>{course.content.split('\n').slice(0, 3).join('\n')}</ReactMarkdown>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToPDF(course);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareCourse(course);
                      }}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Share
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this course?')) {
                          deleteCourse(course.id);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Generated Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLessons.length === 0 ? (
              <div className="text-gray-400">No lessons generated yet. Generate lessons from your courses!</div>
            ) : (
              savedLessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#252525] p-6 rounded-xl shadow-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="cursor-pointer" onClick={() => setSelectedLesson(lesson)}>
                    <h3 className="text-lg font-semibold text-white mb-1">{lesson.lesson_title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{lesson.module_title}</p>
                    <div className="prose prose-invert max-w-none text-sm line-clamp-3">
                      <ReactMarkdown>{lesson.content.split('\n').slice(0, 3).join('\n')}</ReactMarkdown>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportLessonToPDF(lesson);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this lesson?')) {
                          deleteLesson(lesson.id);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedQuizzes.length === 0 ? (
              <div className="text-gray-400">No quizzes created yet. Create your first quiz!</div>
            ) : (
              savedQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#252525] p-6 rounded-xl shadow-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="cursor-pointer" onClick={() => setSelectedQuiz(quiz)}>
                    <h3 className="text-lg font-semibold text-white mb-1">{quiz.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">Difficulty: {quiz.difficulty}</p>
                    <div className="prose prose-invert max-w-none text-sm line-clamp-3">
                      <ReactMarkdown>{quiz.content.split('\n').slice(0, 3).join('\n')}</ReactMarkdown>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(quiz.content);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportQuizToPDF(quiz);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this quiz?')) {
                          deleteQuiz(quiz.id);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
