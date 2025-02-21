import { BrowserRouter as Router, Routes as RoutesComponent, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LearnMore from './components/LearnMore';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
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
    <HelmetProvider>
      <SubscriptionProvider>
        <Router>
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
        </Router>
      </SubscriptionProvider>
      <Analytics />
    </HelmetProvider>
  );
}

export default App;
