import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseDemo = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [step, setStep] = useState(-1);
  const [showOutline, setShowOutline] = useState(false);

  const demoSteps = [
    "Analyzing topic...",
    "Structuring course content...",
    "Generating learning objectives...",
    "Creating lesson plans..."
  ];

  const courseOutline = [
    {
      icon: "📚",
      title: "Photography Basics",
      items: [
        {
          icon: "📖",
          title: "Module 1: Understanding Your Camera",
          items: [
            { icon: "📝", title: "Lesson 1: Camera Types and Functions" },
            { icon: "📝", title: "Lesson 2: Basic Camera Settings" },
            { icon: "✏️", title: "Quiz: Camera Fundamentals" }
          ]
        },
        {
          icon: "📖",
          title: "Module 2: Composition Techniques",
          items: [
            { icon: "📝", title: "Lesson 1: Rule of Thirds" },
            { icon: "📝", title: "Lesson 2: Leading Lines" },
            { icon: "🎯", title: "Practice Exercise: Composition" }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    if (isStarted && step < demoSteps.length) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (step >= demoSteps.length) {
      setShowOutline(true);
    }
  }, [step, isStarted]);

  const startDemo = () => {
    setIsStarted(true);
    setStep(0);
    setShowOutline(false);
  };

  const resetDemo = () => {
    setIsStarted(false);
    setStep(-1);
    setShowOutline(false);
  };

  const renderOutlineItem = (item: any, depth = 0) => (
    <motion.div
      style={{ marginLeft: `${depth * 24}px` }}
      className="outline-item group"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 py-2">
        <span className="text-lg">{item.icon}</span>
        <span className="group-hover:text-purple-400 transition-colors">{item.title}</span>
      </div>
      {item.items && (
        <div className="space-y-2 mt-2">
          {item.items.map((subItem: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {renderOutlineItem(subItem, depth + 1)}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="demo-container gradient-glow">
      <div className="max-w-3xl mx-auto">
        {!isStarted ? (
          <motion.button
            onClick={startDemo}
            className="w-full py-4 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">▶️</span>
            Click to Start Demo
          </motion.button>
        ) : (
          <>
            <div className="mb-6 relative">
              <input
                type="text"
                className="demo-input typing-effect"
                value="Photography Basics for Beginners"
                readOnly
              />
            </div>
            
            <div className="demo-progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / demoSteps.length) * 100}%` }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>

            <div className="mt-4 min-h-[300px]">
              {step >= 0 && step < demoSteps.length && (
                <div className="demo-message">
                  <span>{demoSteps[step]}</span>
                  <div className="dot-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {showOutline && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="course-outline mt-8 space-y-6"
                  >
                    {courseOutline.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        {renderOutlineItem(item)}
                      </motion.div>
                    ))}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="flex justify-center mt-8"
                    >
                      <button
                        onClick={resetDemo}
                        className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                      >
                        Reset Demo
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseDemo;
