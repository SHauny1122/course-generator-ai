import { motion } from 'framer-motion';
import { useState } from 'react';
import Auth from './Auth';
import LearnMore from './LearnMore';
import CourseDemo from './CourseDemo';
import '../styles/animations.css';
import SEO from './SEO';
import { trackTwitterEvent } from '../utils/analytics';
import screenshot1 from '../assets/screenshots/Untitled design (8).png';
import screenshot2 from '../assets/screenshots/Untitled design (7).png';
import workspaceImage from '../assets/images/jonathan-borba-bI7BzgIsmzg-unsplash.jpg';
import teacherImage from '../assets/images/brooke-cagle-WHWYBmtn3_0-unsplash.jpg';

const FeatureCard = ({ title, description, items, index }: { title: string; description: string; items: string[]; index: number }) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="gradient-glow p-8 hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center text-gray-300">
            <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const handlePricingClick = () => {
    trackTwitterEvent();
    setShowLearnMore(true);
  };

  const features = [
    {
      title: "AI Mini-Course Generation",
      description: "Generate mini-courses and guides on any topic using our powerful AI technology. The fastest way to create teachable content.",
      items: [
        "From hobbies to professional skills",
        "Ready in 30 seconds",
        "Quick course generator for any topic"
      ]
    },
    {
      title: "Smart Knowledge Sharing",
      description: "AI-powered content organization for perfect understanding. Create teachable courses that engage your audience.",
      items: [
        "Interactive knowledge checks",
        "Optimized learning paths",
        "Teachable content structure"
      ]
    },
    {
      title: "Rapid Results",
      description: "Turn your knowledge into structured, teachable content instantly. Our quick course creator saves you hours of work.",
      items: [
        "Fully customizable guides",
        "Share-ready formats",
        "Instant mini-course creation"
      ]
    },
    {
      title: "AI Efficiency",
      description: "Create detailed content on any subject with our smart AI course generator. Always up-to-date and effective.",
      items: [
        "24/7 content generation",
        "Always up-to-date AI",
        "Quick course building tools"
      ]
    }
  ];

  const pricingTiers = [
    {
      tier: "Free",
      price: "$0",
      features: [
        "5 mini-courses",
        "15 lessons",
        "10 quizzes",
        "5,000 tokens for AI generation",
        "GPT-4 powered generation",
        "No credit card required"
      ],
      popular: false,
      actionText: "Start Free",
      onAction: () => {
        trackTwitterEvent();
        setShowAuth(true);
      }
    },
    {
      tier: "Basic",
      price: "$9.99",
      features: [
        "15 mini-courses",
        "45 lessons",
        "30 quizzes",
        "15,000 tokens for AI generation",
        "GPT-4 powered generation",
        "24-hour support response"
      ],
      popular: false,
      actionText: "Get Basic",
      onAction: handlePricingClick
    },
    {
      tier: "Pro",
      price: "$19.99",
      features: [
        "100 mini-courses",
        "500 lessons",
        "300 quizzes",
        "Unlimited AI generation",
        "Priority GPT-4 access",
        "Custom branding",
        "Team sharing",
        "Advanced analytics",
        "12-hour premium support"
      ],
      popular: true,
      actionText: "Go Pro",
      onAction: handlePricingClick
    }
  ];

  if (showAuth) {
    return <Auth onClose={() => setShowAuth(false)} />;
  }

  if (showLearnMore) {
    return <LearnMore onBack={() => setShowLearnMore(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
      <SEO />
      <nav className="fixed w-full bg-[#0F172A]/80 backdrop-blur p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">Course Generator</span>
          <div className="flex items-center gap-4">
            <button onClick={handlePricingClick} className="text-gray-300 hover:text-white">Pricing</button>
            <button onClick={() => {
              trackTwitterEvent();
              setShowAuth(true);
            }} className="text-gray-300 hover:text-white border border-purple-500/20 px-4 py-2 rounded-full">Login</button>
            <button onClick={() => {
              trackTwitterEvent();
              setShowAuth(true);
            }} className="bg-purple-600 text-white px-4 py-2 rounded-full">Get Started Free</button>
          </div>
        </div>
      </nav>
      <div className="pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            {/* Main content container */}
            <div className="flex flex-col space-y-12">
              {/* Top section - Headline and subheadline */}
              <div className="text-center mx-auto max-w-3xl">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow mb-6"
                >
                  Create Professional Mini-Courses with AI
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-gray-400 mb-8"
                >
                  Transform your expertise into engaging mini-courses in minutes with our quick course generator - the smart way to create teachable content
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <button
                    onClick={() => {
                      trackTwitterEvent();
                      setShowAuth(true);
                    }}
                    className="px-8 py-4 rounded-full text-white font-medium transition-all duration-300
                      bg-gradient-to-r from-purple-600 to-blue-600
                      hover:from-purple-500 hover:to-blue-500
                      shadow-[0_0_20px_rgba(147,51,234,0.3)]
                      hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]
                      hover:-translate-y-1
                      animate-glow"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={handlePricingClick}
                    className="px-8 py-4 rounded-full text-gray-300 font-medium transition-all duration-300
                      bg-white/5 hover:bg-white/10
                      border border-white/10 hover:border-white/20
                      hover:-translate-y-1"
                  >
                    View Pricing
                  </button>
                </motion.div>
              </div>

              {/* Demo Video Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-4xl mx-auto mt-8 mb-16 px-4 sm:px-6 lg:px-8"
              >
                <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-2xl bg-[#1E293B] border border-purple-500/20">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/yi4cJfgcfK0"
                    title="AI Mini-Course Generator Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>

              {/* Bottom section - Stats and Image */}
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8 px-4 lg:px-0">
                {/* Stats Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full lg:w-[550px] [perspective:1000px] [transform-style:preserve-3d]"
                >
                  <motion.div 
                    initial={{ rotateX: 10, rotateY: -10 }}
                    animate={{ rotateX: 0, rotateY: 0 }}
                    className="bg-[#1E293B] p-6 rounded-xl border border-purple-500/30"
                  >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                      AI Mini-Course Generation
                    </h3>
                    <div className="text-gray-400 space-y-2">
                      <p>Generate mini-courses and guides on any topic using GPT-4 AI technology</p>
                      <p className="text-sm text-purple-300">• From hobbies to professional skills</p>
                      <p className="text-sm text-purple-300">• Ready in 30 seconds</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ rotateX: 10, rotateY: 10 }}
                    animate={{ rotateX: 0, rotateY: 0 }}
                    className="bg-[#1E293B] p-6 rounded-xl border border-purple-500/30"
                  >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                      Smart Knowledge Sharing
                    </h3>
                    <div className="text-gray-400 space-y-2">
                      <p>AI-powered content organization for perfect understanding</p>
                      <p className="text-sm text-purple-300">• Interactive knowledge checks</p>
                      <p className="text-sm text-purple-300">• Optimized learning paths</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ rotateX: -10, rotateY: -10 }}
                    animate={{ rotateX: 0, rotateY: 0 }}
                    className="bg-[#1E293B] p-6 rounded-xl border border-purple-500/30"
                  >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                      Rapid Results
                    </h3>
                    <div className="text-gray-400 space-y-2">
                      <p>Turn your knowledge into structured content instantly</p>
                      <p className="text-sm text-purple-300">• Fully customizable guides</p>
                      <p className="text-sm text-purple-300">• Share-ready formats</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ rotateX: -10, rotateY: 10 }}
                    animate={{ rotateX: 0, rotateY: 0 }}
                    className="bg-[#1E293B] p-6 rounded-xl border border-purple-500/30"
                  >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                      AI Efficiency
                    </h3>
                    <div className="text-gray-400 space-y-2">
                      <p>Create detailed content on any subject with GPT-4</p>
                      <p className="text-sm text-purple-300">• 24/7 content generation</p>
                      <p className="text-sm text-purple-300">• Always up-to-date AI</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full lg:w-[500px]"
                >
                  <img 
                    src={workspaceImage}
                    alt="Professional creating AI-powered mini-courses"
                    className="w-full rounded-lg"
                  />
                </motion.div>
              </div>

              {/* Features Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow mb-4">
                    Features that empower you
                  </h2>
                  <p className="text-xl text-gray-400">
                    Everything you need to create professional mini-courses with ease
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {features.map((feature, index) => (
                    <FeatureCard
                      key={index}
                      title={feature.title}
                      description={feature.description}
                      items={feature.items}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              {/* Center Image */}
              <div className="flex justify-center mb-24">
                <img 
                  src={teacherImage}
                  alt="Teacher creating online courses"
                  className="w-[800px] rounded-lg"
                />
              </div>

              {/* Screenshots Section */}
              <div className="mt-24 relative">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow mb-4">
                    Powerful Course Creation Tools
                  </h2>
                  <p className="text-xl text-gray-400">
                    Generate professional mini-courses and lessons with our intuitive interface
                  </p>
                </div>

                {/* Screenshots with floating animation */}
                <div className="flex flex-col lg:flex-row gap-12 justify-center items-center px-4 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative group w-full lg:w-[600px]"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative">
                      <img 
                        src={screenshot1}
                        alt="Course Generation Interface" 
                        className="rounded-xl shadow-2xl w-full transform transition duration-500 hover:scale-105"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative group w-full lg:w-[600px]"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative">
                      <img 
                        src={screenshot2}
                        alt="Course Dashboard" 
                        className="rounded-xl shadow-2xl w-full transform transition duration-500 hover:scale-105"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Demo Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow mb-4">
                    See it in action
                  </h2>
                  <p className="text-xl text-gray-400">
                    Watch how easy it is to create a mini-course with our AI
                  </p>
                </div>
                <CourseDemo />
              </div>

              {/* Pricing Section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow mb-4">
                    Simple, transparent pricing
                  </h2>
                  <p className="text-xl text-gray-400">
                    Choose the plan that works best for you
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pricingTiers.map((tier, index) => (
                    <motion.div
                      key={tier.tier}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`gradient-glow relative ${tier.popular ? 'border-purple-500/30' : ''}`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-lg">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">{tier.tier}</h3>
                        <div className="flex items-baseline mb-8">
                          <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                          <span className="text-gray-400 ml-2">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-gray-300">
                              <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={tier.onAction}
                          className="w-full px-6 py-3 rounded-full text-white font-medium transition-all duration-300
                            bg-gradient-to-r from-purple-600 to-blue-600
                            hover:from-purple-500 hover:to-blue-500
                            shadow-[0_0_20px_rgba(147,51,234,0.3)]
                            hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]
                            hover:-translate-y-1
                            animate-glow"
                        >
                          {tier.actionText}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
