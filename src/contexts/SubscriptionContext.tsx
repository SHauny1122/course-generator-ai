import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Subscription } from '../hooks/useSubscription';

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  error: null
});

export const useSubscriptionContext = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSubscription = async () => {
      try {
        setError(null);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) {
            setLoading(false);
            setSubscription(null);
          }
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
            .insert([
              {
                user_id: session.user.id,
                tier: 'free',
                courses_used: 0,
                quizzes_used: 0,
                tokens_used: 0,
                active: true
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          
          if (mounted) {
            setSubscription(newSub);
          }
        } else if (mounted) {
          setSubscription(currentSub);
        }
      } catch (err) {
        console.error('Error in subscription context:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load subscription');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Load initial subscription
    loadSubscription();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadSubscription();
      } else if (mounted) {
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, error }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
