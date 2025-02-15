import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SubscriptionTier } from '../hooks/useSubscription';

interface PayPalButtonProps {
  planId: string;
  tier: SubscriptionTier;
  onSuccess?: (subscriptionId: string) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

let scriptPromise: Promise<void> | null = null;

const loadPayPalScript = () => {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};

export const PayPalButton = ({ planId, tier, onSuccess }: PayPalButtonProps) => {
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const renderButton = async () => {
      if (!paypalButtonRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        await loadPayPalScript();

        if (!mounted) return;

        if (window.paypal) {
          const buttons = window.paypal.Buttons({
            style: {
              shape: 'pill',
              color: 'gold',
              layout: 'vertical',
              label: 'subscribe'
            },
            createSubscription: (_data: any, actions: any) => {
              return actions.subscription.create({
                plan_id: planId
              });
            },
            onApprove: async (data: any, _actions: any) => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                  throw new Error('User not authenticated');
                }

                // Update user's subscription in Supabase
                const { error: updateError } = await supabase
                  .from('subscriptions')
                  .upsert({
                    user_id: user.id,
                    subscription_id: data.subscriptionID,
                    tier: tier,
                    active: true,
                    updated_at: new Date().toISOString()
                  })
                  .eq('user_id', user.id);

                if (updateError) throw updateError;

                if (onSuccess) {
                  onSuccess(data.subscriptionID);
                }
              } catch (err) {
                console.error('Error updating subscription:', err);
                setError('Failed to update subscription. Please contact support.');
              }
            }
          });

          if (paypalButtonRef.current.children.length === 0) {
            await buttons.render(paypalButtonRef.current);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('PayPal button error:', err);
          setError('Failed to load PayPal button. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    renderButton();

    return () => {
      mounted = false;
    };
  }, [planId, tier, onSuccess]);

  if (error) {
    return (
      <div className="text-red-500 text-sm text-center p-2">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-[150px] flex items-center justify-center">
      {isLoading && (
        <div className="text-gray-400 text-sm">Loading payment options...</div>
      )}
      <div 
        ref={paypalButtonRef} 
        className={isLoading ? 'hidden' : 'w-full'}
      />
    </div>
  );
};
