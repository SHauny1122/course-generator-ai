import { BrowserRouter as Router, Routes as RoutesComponent, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LearnMore from './components/LearnMore';
import { supabase, checkAuthAndAccess } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      console.log('Auth state change in App:', { 
        hasSession: !!session,
        userId: session?.user?.id 
      });

      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <SubscriptionProvider>
        <div className="min-h-screen bg-[#1E1E1E]">
          <RoutesComponent>
            <Route 
              path="/" 
              element={!session ? <LandingPage /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={session ? <Dashboard /> : <Navigate to="/" />} 
            />
            <Route path="/learn-more" element={<LearnMore />} />
          </RoutesComponent>
        </div>
      </SubscriptionProvider>
    </Router>
  );
}

export default App;
