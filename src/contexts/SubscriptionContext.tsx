import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Subscription, SubscriptionLimits } from '../hooks/useSubscription';

type UsageType = 'courses' | 'quizzes' | 'tokens' | 'lessons';
type MaxKey = 'maxCourses' | 'maxQuizzes' | 'maxTokens' | 'maxLessons';

const getMaxKey = (type: UsageType): MaxKey => {
  switch (type) {
    case 'courses': return 'maxCourses';
    case 'quizzes': return 'maxQuizzes';
    case 'tokens': return 'maxTokens';
    case 'lessons': return 'maxLessons';
  }
};

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  canUse: (type: UsageType) => boolean;
  updateUsage: (type: UsageType, amount?: number) => Promise<boolean>;
  incrementUsage: (type: UsageType) => Promise<void>;
  refreshSubscription: () => Promise<void>;
  getLimits: () => SubscriptionLimits;
}

const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    maxCourses: 5,
    maxQuizzes: 10,
    maxTokens: 5000,
    maxLessons: 15,
    hasTeamSharing: false,
    hasCustomBranding: false,
    hasAdvancedAnalytics: false,
    responseTime: 48,
  },
  basic: {
    maxCourses: 10,
    maxQuizzes: 20,
    maxTokens: 2000,
    maxLessons: 15,
    hasTeamSharing: false,
    hasCustomBranding: false,
    hasAdvancedAnalytics: false,
    responseTime: 24,
  },
  pro: {
    maxCourses: Infinity,
    maxQuizzes: Infinity,
    maxTokens: 4000,
    maxLessons: Infinity,
    hasTeamSharing: true,
    hasCustomBranding: true,
    hasAdvancedAnalytics: true,
    responseTime: 4,
  }
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: false,
  error: null,
  canUse: () => false,
  updateUsage: async () => false,
  incrementUsage: async () => {},
  refreshSubscription: async () => {},
  getLimits: () => SUBSCRIPTION_LIMITS.free
});

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const { data, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();

      if (data) {
        setSubscription(data);
        setError(null);
      } else if (subscriptionError) {
        // If no subscription exists, create a free one
        const { error: createError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: user.id,
              tier: 'free',
              courses_used: 0,
              quizzes_used: 0,
              tokens_used: 0,
              lessons_used: 0,
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating subscription:', createError);
          setError('Failed to create subscription');
          setSubscription(null);
        } else {
          // Fetch the newly created subscription
          const { data: newSub, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('active', true)
            .maybeSingle();

          if (fetchError || !newSub) {
            setError('Failed to fetch new subscription');
            setSubscription(null);
          } else {
            setSubscription(newSub);
            setError(null);
          }
        }
      }
    } catch (error) {
      console.error('Subscription context error:', error);
      setError('An unexpected error occurred');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchSubscription();
      } else {
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => {
      authSubscription?.unsubscribe();
    };
  }, [fetchSubscription]);

  const canUse = (type: UsageType): boolean => {
    if (!subscription) {
      console.log('Subscription check failed: No subscription found');
      return false;
    }
    
    const limits = SUBSCRIPTION_LIMITS[subscription.tier];
    const usage = {
      courses: subscription.courses_used,
      quizzes: subscription.quizzes_used,
      tokens: subscription.tokens_used,
      lessons: subscription.lessons_used,
    };
    
    const maxValues = {
      courses: limits.maxCourses,
      quizzes: limits.maxQuizzes,
      tokens: limits.maxTokens,
      lessons: limits.maxLessons,
    };

    console.log('Subscription check:', {
      type,
      tier: subscription.tier,
      currentUsage: usage[type],
      maxAllowed: maxValues[type],
      isAllowed: usage[type] < maxValues[type]
    });

    return usage[type] < maxValues[type];
  };

  const updateUsage = async (type: UsageType, amount = 1): Promise<boolean> => {
    if (!subscription) return false;
    const used = subscription[`${type}_used`] as number;
    const newUsed = used + amount;
    const limits = SUBSCRIPTION_LIMITS[subscription.tier];
    const maxKey = getMaxKey(type);
    
    if (newUsed > limits[maxKey]) return false;

    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({ [`${type}_used`]: newUsed })
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) throw updateError;
    setSubscription(updatedSub);
    return true;
  };

  const incrementUsage = async (type: UsageType): Promise<void> => {
    if (!subscription) return;
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          [`${type}_used`]: (subscription[`${type}_used`] || 0) + 1
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription({
        ...subscription,
        [`${type}_used`]: (subscription[`${type}_used`] || 0) + 1
      });
    } catch (error) {
      console.error(`Error incrementing ${type} usage:`, error);
      throw error;
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const getLimits = (): SubscriptionLimits => {
    if (!subscription) return SUBSCRIPTION_LIMITS.free;
    return SUBSCRIPTION_LIMITS[subscription.tier];
  };

  const value = useMemo(() => ({
    subscription,
    loading,
    error,
    canUse,
    updateUsage,
    incrementUsage,
    refreshSubscription,
    getLimits
  }), [subscription, loading, error]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
