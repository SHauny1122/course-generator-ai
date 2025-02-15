import { motion } from 'framer-motion';
import { useState } from 'react';
import Auth from './Auth';
import LearnMore from './LearnMore';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  if (showAuth) {
    return <Auth />;
  }

  if (showLearnMore) {
    return <LearnMore />;
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-16 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Course & Quiz Generator
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Create professional courses and interactive quizzes in seconds. Perfect for educators, trainers, and anyone who wants to share knowledge.
        </p>

        <div className="flex gap-4 justify-center mb-20">
          <button 
            onClick={() => setShowAuth(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
          <button 
            onClick={() => setShowLearnMore(true)}
            className="px-8 py-3 text-white rounded-lg text-lg font-medium border border-gray-600 hover:border-gray-400 transition-colors"
          >
            Learn More
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-[#252525] p-8 rounded-xl"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Course Generation</h2>
            <p className="text-gray-400">Create structured courses with detailed lessons, learning objectives, and exercises in minutes.</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-[#252525] p-8 rounded-xl"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Quiz Creation</h2>
            <p className="text-gray-400">Generate custom quizzes with multiple question types to test and reinforce learning.</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-[#252525] p-8 rounded-xl"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">AI-Powered Learning</h2>
            <p className="text-gray-400">Advanced AI ensures your content is engaging, accurate, and tailored to your audience.</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-[#252525] p-8 rounded-xl"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Easy Sharing</h2>
            <p className="text-gray-400">Export your courses and quizzes in multiple formats for easy sharing and distribution.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
