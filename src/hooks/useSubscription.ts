import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface Subscription {
  id: string;
  user_id: string;
  subscription_id: string | null;
  tier: SubscriptionTier;
  courses_used: number;
  quizzes_used: number;
  tokens_used: number;
  lessons_used: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_reset?: string;
  [key: string]: string | number | boolean | null | undefined; 
}

export interface SubscriptionLimits {
  maxCourses: number;
  maxQuizzes: number;
  maxTokens: number;
  maxLessons: number;
  hasTeamSharing: boolean;
  hasCustomBranding: boolean;
  hasAdvancedAnalytics: boolean;
  responseTime: number;
}

const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
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
    maxCourses: 15,
    maxQuizzes: 30,
    maxTokens: 15000,
    maxLessons: 45,
    hasTeamSharing: false,
    hasCustomBranding: false,
    hasAdvancedAnalytics: false,
    responseTime: 24,
  },
  pro: {
    maxCourses: 100,
    maxQuizzes: 300,
    maxTokens: Number.MAX_SAFE_INTEGER, // Effectively unlimited
    maxLessons: 500,
    hasTeamSharing: true,
    hasCustomBranding: true,
    hasAdvancedAnalytics: true,
    responseTime: 12,
  },
};

type UsageType = 'courses' | 'quizzes' | 'tokens' | 'lessons';
type UsageField = `${UsageType}_used`;

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAndResetUsage = async (sub: Subscription) => {
    const now = new Date();
    const lastReset = sub.last_reset ? new Date(sub.last_reset) : new Date(sub.created_at);
    const monthDiff = (now.getMonth() - lastReset.getMonth()) + 
                     (12 * (now.getFullYear() - lastReset.getFullYear()));

    if (monthDiff >= 1) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          courses_used: 0,
          quizzes_used: 0,
          tokens_used: 0,
          lessons_used: 0,
          last_reset: now.toISOString(),
        })
        .eq('id', sub.id);

      if (!error) {
        return {
          ...sub,
          courses_used: 0,
          quizzes_used: 0,
          tokens_used: 0,
          lessons_used: 0,
          last_reset: now.toISOString(),
        };
      }
    }
    return sub;
  };

  const loadSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      // Fetch most recent active subscription
      const { data: subs, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const currentSub = subs?.[0];

      if (!currentSub) {
        // Create a free subscription if none exists
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: session.user.id,
            tier: 'free',
            courses_used: 0,
            quizzes_used: 0,
            tokens_used: 0,
            lessons_used: 0,
            active: true,
            last_reset: new Date().toISOString(),
          }])
          .select()
          .single();

        if (createError) throw createError;
        setSubscription(newSub);
      } else {
        // Check and reset monthly usage if needed
        const updatedSub = await checkAndResetUsage(currentSub);
        setSubscription(updatedSub);
      }
    } catch (err) {
      console.error('Error in subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const canUse = (type: UsageType): boolean => {
    if (!subscription) return false;
    
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

    return usage[type] < maxValues[type];
  };

  const updateUsage = async (type: UsageType, amount = 1): Promise<boolean> => {
    if (!subscription) return false;
    if (!canUse(type)) return false;

    const field: UsageField = `${type}_used`;
    const currentValue = subscription[field] as number;
    const newValue = currentValue + amount;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ [field]: newValue })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription({
        ...subscription,
        [field]: newValue,
      });

      return true;
    } catch (error) {
      console.error(`Error updating ${type} usage:`, error);
      return false;
    }
  };

  const getLimits = () => {
    if (!subscription) return SUBSCRIPTION_LIMITS.free;
    return SUBSCRIPTION_LIMITS[subscription.tier];
  };

  useEffect(() => {
    loadSubscription();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('subscription_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        loadSubscription
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { subscription, loading, error, canUse, updateUsage, getLimits };
}
