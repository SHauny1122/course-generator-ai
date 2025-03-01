import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { cancelSubscription } from '../lib/paypalService';

interface UserProfile {
  email: string;
  created_at: string;
}

interface SubscriptionDetails {
  tier: string;
  tokens_used: number;
  subscription_status: string;
  subscription_end_date: string | null;
  subscription_id: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      // Fetch subscription details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError) throw subscriptionError;

      setProfile({
        email: user.email || '',
        created_at: user.created_at || '',
      });

      setSubscription({
        tier: subscriptionData?.tier || 'free',
        tokens_used: subscriptionData?.tokens_used || 0,
        subscription_status: subscriptionData?.subscription_status || 'inactive',
        subscription_end_date: subscriptionData?.subscription_end_date || null,
        subscription_id: subscriptionData?.subscription_id || null,
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First cancel the subscription in PayPal
      if (subscription?.subscription_id) {
        await cancelSubscription(subscription.subscription_id);
      }

      // Then update our database
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          subscription_status: 'cancelled',
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh the profile data
      await fetchProfileData();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      // Show error message to user
      alert('Failed to cancel subscription. Please try again or contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1F2E] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E] text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-black/20 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-2">
              <p><span className="text-gray-400">Email:</span> {profile?.email}</p>
              <p><span className="text-gray-400">Member since:</span> {new Date(profile?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="bg-black/20 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
            <div className="space-y-2">
              <p>
                <span className="text-gray-400">Current Plan:</span>{' '}
                <span className="capitalize">{subscription?.tier}</span>
              </p>
              <p>
                <span className="text-gray-400">Status:</span>{' '}
                <span className="capitalize">{subscription?.subscription_status}</span>
              </p>
              <p><span className="text-gray-400">Tokens Used:</span> {subscription?.tokens_used}</p>
              {subscription?.subscription_end_date && (
                <p>
                  <span className="text-gray-400">Access Until:</span>{' '}
                  {new Date(subscription.subscription_end_date).toLocaleDateString()}
                </p>
              )}
            </div>

            {subscription?.tier !== 'free' && subscription?.subscription_status === 'active' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300
                    bg-red-600 hover:bg-red-500
                    shadow-[0_0_10px_rgba(220,38,38,0.3)]
                    hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Cancel Subscription?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300
                  bg-red-600 hover:bg-red-500"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
