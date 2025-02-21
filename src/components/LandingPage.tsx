import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import Auth from './Auth';
import LearnMore from './LearnMore';
import '../styles/animations.css';

const FeatureCard = ({ title, description, index }: { title: string; description: string; index: number }) => {
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div 
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 300 }
      }}
      className="bg-gradient-to-b from-[#252525] to-[#2a2a2a] p-8 rounded-xl transform-gpu border border-gray-800 hover:border-gray-700 transition-colors shadow-lg"
    >
      <div className="relative overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 opacity-5 rounded-full blur-2xl"
        />
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-4 relative z-10">{title}</h2>
        <p className="text-gray-400 relative z-10 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

const PricingCard = ({ tier, price, features, popular, onAction, actionText }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -10,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        transition: { type: "spring", stiffness: 300 }
      }}
      className={`bg-[#1E1E1E] p-8 rounded-xl ${popular ? 'border-2 border-blue-500' : 'border border-gray-700'} relative transform-gpu`}
    >
      {popular && (
        <motion.div
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium"
        >
          POPULAR
        </motion.div>
      )}
      <h3 className="text-2xl font-bold text-white mb-4">{tier}</h3>
      <p className="text-3xl font-bold text-white mb-8">{price}<span className="text-lg font-normal text-gray-400">/month</span></p>
      <ul className="space-y-4 mb-8">
        {features.map((feature: string, index: number) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-gray-400 flex items-center"
          >
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </motion.li>
        ))}
      </ul>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
        className={`w-full px-6 py-3 ${popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-lg font-medium transition-colors`}
      >
        {actionText}
      </motion.button>
    </motion.div>
  );
};

const LandingPage = () => {
  // All hooks must be at the top level
  const [showAuth, setShowAuth] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      title: "Course Generation",
      description: "Create structured courses with detailed lessons, learning objectives, and exercises in minutes."
    },
    {
      title: "Quiz Creation",
      description: "Generate custom quizzes with multiple question types to test and reinforce learning."
    },
    {
      title: "AI-Powered Learning",
      description: "Advanced AI ensures your content is engaging, accurate, and tailored to your audience."
    },
    {
      title: "Easy Sharing",
      description: "Export your courses and quizzes in multiple formats for easy sharing and distribution."
    }
  ];

  const pricingTiers = [
    {
      tier: "Free",
      price: "$0",
      features: [
        "Generate 3 courses/month",
        "Basic quiz generation",
        "Export to Text"
      ],
      actionText: "Get Started",
      onAction: () => setShowAuth(true)
    },
    {
      tier: "Pro",
      price: "$19",
      features: [
        "Unlimited courses",
        "Advanced quiz features",
        "Priority support",
        "Export to multiple formats"
      ],
      popular: true,
      actionText: "Start Free Trial",
      onAction: () => setShowLearnMore(true)
    },
    {
      tier: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated support",
        "Custom features"
      ],
      actionText: "Contact Sales",
      onAction: () => setShowLearnMore(true)
    }
  ];

  if (showAuth) {
    return <Auth />;
  }

  if (showLearnMore) {
    return <LearnMore />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#252525] overflow-hidden">
      {/* Hero Section */}
      <div className="relative flex items-center justify-center min-h-screen">
        <motion.div 
          style={{ scale, opacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-4000" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto px-6 py-24 text-center relative z-10"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="relative"
          >
            <span className="text-7xl md:text-8xl font-bold mb-8 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-white to-blue-100 drop-shadow-2xl tracking-tight">
              Course & Quiz
              <span className="block mt-4">Generator</span>
            </span>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1.5 }}
              className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"
            />
            <div className="absolute -inset-x-20 top-0 h-[calc(100%+4rem)] -skew-y-3 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 z-[-1]" />
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl z-[-1]"
          >
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed"
          >
            Create professional courses and interactive quizzes in seconds. Perfect for educators, trainers, and anyone who wants to share knowledge.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="flex gap-6 justify-center mb-24"
          >
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAuth(true)}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              Get Started
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, borderColor: "rgb(156, 163, 175)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLearnMore(true)}
              className="px-10 py-4 text-white rounded-xl text-lg font-medium border-2 border-gray-700 hover:border-gray-500 transition-all duration-300 backdrop-blur-sm bg-[#25252510]"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-24 px-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-[#252525]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white text-center mb-12"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <PricingCard key={index} {...tier} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
