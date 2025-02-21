import { motion } from 'framer-motion';
import { useState } from 'react';
import Auth from './Auth';
import LearnMore from './LearnMore';
import '../styles/animations.css';
import SEO from './SEO';

const FeatureCard = ({ title, description, index }: { title: string; description: string; index: number }) => {
  const variants = {
    hidden: { y: 50 },
    visible: (i: number) => ({
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
      initial={{ scale: 0.9 }}
      whileInView={{ scale: 1 }}
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
            initial={{ x: -20 }}
            whileInView={{ x: 0 }}
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
  const [showAuth, setShowAuth] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const features = [
    {
      title: "GPT-4 Powered Course Generation",
      description: "Create professional courses instantly using OpenAI's most advanced AI. Perfect for any subject or skill level."
    },
    {
      title: "Smart Lesson Planning",
      description: "Generate detailed, engaging lessons automatically. Save hours of preparation time with AI-powered content."
    },
    {
      title: "Interactive Quiz Creation",
      description: "Create engaging quizzes to test knowledge retention. Our AI ensures questions are relevant and challenging."
    }
  ];

  const pricingTiers = [
    {
      tier: "Free",
      price: "$0",
      features: [
        "1 course per month",
        "5 lessons per month",
        "3 quizzes per month",
        "GPT-4 powered generation",
        "No credit card required"
      ],
      popular: false,
      actionText: "Start Free"
    },
    {
      tier: "Pro",
      price: "$19.99",
      features: [
        "Unlimited courses",
        "Unlimited lessons",
        "Unlimited quizzes",
        "Priority GPT-4 access",
        "Premium support",
        "Custom templates"
      ],
      popular: true,
      actionText: "Go Pro"
    }
  ];

  if (showAuth) {
    return <Auth />;
  }

  if (showLearnMore) {
    return <LearnMore />;
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <SEO />
      <div className="relative">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text"
            >
              Create Unlimited Courses with GPT-4 AI
            </motion.h1>
            <motion.p 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 mb-8 leading-relaxed"
            >
              Transform your expertise into professional courses, lessons, and quizzes instantly. 
              Powered by GPT-4, our AI creates engaging content in seconds. Start free, upgrade for unlimited access.
            </motion.p>
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.4 }}
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
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2 
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-white text-center mb-12"
            >
              What You Can Do
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20 bg-[#252525]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2 
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-white text-center mb-12"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-8">
              {pricingTiers.map((tier, index) => (
                <PricingCard key={index} {...tier} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
