import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthProps {
  onBack?: () => void;
  onClose?: () => void;
  selectedPlan?: string | null;
}

export default function Auth({ onBack, onClose, selectedPlan }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // First, sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              selected_plan: selectedPlan || 'free'
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('No user data returned');

        // Show success message for email verification
        setError('Please check your email to verify your account. You can close this window.');
        
        try {
          // Try to create subscription, but don't fail if it doesn't work
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert([
              {
                user_id: data.user.id,
                tier: selectedPlan || 'free',
                courses_used: 0,
                quizzes_used: 0,
                tokens_used: 0,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
            ])
            .select()
            .single();

          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError);
            // Log error but don't throw - we'll handle this later
          }
        } catch (subError) {
          console.error('Subscription creation error:', subError);
          // Don't throw - we'll handle this when user confirms email
        }

        return; // Exit here - user needs to verify email

      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        
        // If we get here, sign in was successful
        if (onClose) onClose();
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google') => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      // If we got user data back, try to create a subscription
      if (data?.user?.id) {
        try {
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert([
              {
                user_id: data.user.id,
                tier: 'free',
                courses_used: 0,
                quizzes_used: 0,
                tokens_used: 0,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
            ])
            .select()
            .single();

          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError);
            // Don't throw - subscription will be created on dashboard if needed
          }
        } catch (subError) {
          console.error('Subscription creation error:', subError);
          // Don't throw - subscription will be created on dashboard if needed
        }
      }
      
      if (error) throw error;
      
    } catch (error) {
      console.error('OAuth error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await handleOAuthLogin('google');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto gradient-glow p-8"
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-glow">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          
          {/* Browser Compatibility Notice */}
          <div className="mb-6 text-sm text-gray-400 bg-[#1E1E1E] p-4 rounded-lg border border-gray-700">
            <p className="font-medium mb-2">⚠️ For the best sign-in experience:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use Chrome, Firefox, or Safari on desktop</li>
              <li>On mobile, open this site directly in Chrome or Safari</li>
              <li>Avoid using in-app browsers (like from Twitter or Facebook)</li>
            </ul>
            <p className="mt-2 text-xs">If you see a security error, please open this site directly in your device's web browser.</p>
          </div>

          {error && (
            <div 
              className={`p-3 rounded-lg text-sm mb-4 ${
                error.includes('check your email') 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 bg-[#333333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 bg-[#333333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-medium text-blue-500 hover:text-blue-400"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#252525] text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-[#333333] hover:bg-[#404040] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
