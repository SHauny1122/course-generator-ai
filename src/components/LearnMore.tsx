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

const LearnMore = () => {
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

    // Create free subscription
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
    <div className="min-h-screen bg-[#1E1E1E] py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transform Your Teaching with AI
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Whether you're an educator, trainer, or subject matter expert, our AI-powered platform
            helps you create professional courses and engaging quizzes in minutes instead of hours.
          </p>
        </motion.div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#252525] p-8 rounded-xl"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">{feature.title}</h2>
              <p className="text-gray-400 mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start text-gray-300">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`bg-[#252525] p-8 rounded-xl border-2 ${
                  plan.popular ? 'border-blue-500' : 'border-gray-700'
                }`}
              >
                {plan.popular && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-gray-300">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.price === "0" ? (
                  <button
                    onClick={handleFreePlan}
                    className="w-full py-3 rounded-lg font-medium transition-colors bg-gray-700 text-white hover:bg-gray-600"
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-8 text-left">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">How does the course generator work?</h3>
              <p className="text-gray-400">Our AI analyzes your topic, audience, and duration requirements to create a structured course outline. It then generates detailed lesson content, complete with examples, exercises, and quizzes.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Can I edit the generated content?</h3>
              <p className="text-gray-400">Yes! While our AI creates high-quality content, you have full control to edit, customize, and refine any generated courses or quizzes to match your exact needs.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept PayPal for all our premium plans, making it easy and secure to upgrade your account from anywhere in the world.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Teaching?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of educators using our platform to create amazing learning experiences.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started Now
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LearnMore;
