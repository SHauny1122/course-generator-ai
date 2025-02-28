import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Auth from './Auth';
import { PayPalButton } from './PayPalButton';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  popular: boolean;
  paypalButton: string;
}

interface Feature {
  title: string;
  description: string;
  items: string[];
}

interface LearnMoreProps {
  onBack: () => void;
}

const LearnMore = ({ onBack }: LearnMoreProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription } = useSubscriptionContext();
  const isUpgrading = location.state?.isUpgrading || false;

  useEffect(() => {
    // Only redirect if user has subscription and is not trying to upgrade
    if (subscription && !isUpgrading) {
      navigate('/dashboard');
    }
  }, [subscription, navigate, isUpgrading]);

  const handleFreePlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setSelectedPlan('free');
      setShowAuth(true);
      return;
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingSubscription) {
      navigate('/dashboard');
      return;
    }

    // Create free subscription only if user doesn't have one
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          tier: 'free',
          courses_used: 0,
          quizzes_used: 0,
          tokens_used: 0,
          active: true,
        },
      ]);

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return;
    }

    navigate('/dashboard');
  };

  const handleBackToHome = () => {
    if (onBack) {
      onBack();
    }
  };

  if (showAuth) {
    return <Auth onClose={() => setShowAuth(false)} selectedPlan={selectedPlan} />;
  }

  const features: Feature[] = [
    {
      title: "Course Generation",
      description: "Our AI-powered course generator helps you create professional courses in minutes:",
      items: [
        "Structured course outlines with clear learning objectives",
        "Detailed lesson content with examples and exercises",
        "Multiple modules and lessons per course",
        "Automatic generation of practice questions",
        "Export options for easy sharing (PDF, clipboard)"
      ]
    },
    {
      title: "Quiz Creation",
      description: "Create engaging quizzes to test and reinforce learning:",
      items: [
        "Multiple question types (Multiple Choice, Fill in the Blank, True/False, Short Answer)",
        "Customizable difficulty levels",
        "Instant quiz generation based on your topic",
        "Save and reuse quizzes",
        "Share quizzes with students or colleagues"
      ]
    },
    {
      title: "AI Technology",
      description: "Powered by advanced AI to ensure quality content:",
      items: [
        "GPT-4 integration for human-like content generation",
        "Context-aware content creation",
        "Educational best practices built-in",
        "Consistent formatting and structure",
        "Regular updates with the latest AI improvements"
      ]
    }
  ];

  const plans: Plan[] = [
    {
      name: 'Free',
      price: '0',
      period: 'Forever',
      features: [
        '5 courses per month',
        '10 quizzes per month',
        '2,000 tokens per generation',
        'PDF export',
        'Email support',
        '48-hour response time'
      ],
      buttonText: 'Get Started',
      popular: false,
      paypalButton: ''
    },
    {
      name: 'Basic',
      price: '9.99',
      period: 'per month',
      features: [
        '15 courses per month',
        '30 quizzes per month',
        '3,000 tokens per generation',
        'PDF export',
        'Priority email support',
        '24-hour response time',
        'Course history'
      ],
      buttonText: 'Subscribe',
      popular: true,
      paypalButton: import.meta.env.VITE_NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID
    },
    {
      name: 'Pro',
      price: '19.99',
      period: 'per month',
      features: [
        'Unlimited courses',
        'Unlimited quizzes',
        '4,000 tokens per generation',
        'PDF export with bulk download',
        'Priority support',
        '4-hour response time',
        'Course history & analytics'
      ],
      buttonText: 'Subscribe',
      popular: false,
      paypalButton: import.meta.env.VITE_NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
    }
  ];

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    // Here you can handle successful subscription
    // For example, update user's subscription status in your database
    console.log('Subscription successful:', subscriptionId);
    // You might want to redirect to a success page or update UI
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={handleBackToHome}
          className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow mb-4">
            Transform Your Teaching with AI
          </h1>
          <p className="text-xl text-gray-400">
            Whether you're an educator, trainer, or subject matter expert, our AI-powered platform
            helps you create professional courses and engaging quizzes in minutes instead of hours.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`gradient-glow relative ${
                plan.popular ? 'border-purple-500/30' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.price === "0" ? (
                  <button
                    onClick={handleFreePlan}
                    className="w-full px-6 py-3 rounded-full text-white font-medium transition-all duration-300
                      bg-gradient-to-r from-purple-600 to-blue-600
                      hover:from-purple-500 hover:to-blue-500
                      shadow-[0_0_20px_rgba(147,51,234,0.3)]
                      hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]
                      hover:-translate-y-1
                      animate-glow"
                  >
                    {plan.buttonText}
                  </button>
                ) : plan.paypalButton ? (
                  <PayPalButton 
                    planId={plan.paypalButton}
                    tier={plan.name.toLowerCase() as 'basic' | 'pro'}
                    onSuccess={handleSubscriptionSuccess}
                  />
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Everything you need to create amazing courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="gradient-glow p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} selectedPlan={selectedPlan} />}
    </div>
  );
};

export default LearnMore;
