import { BrowserRouter as Router, Routes as RoutesComponent, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LearnMore from './components/LearnMore';
import PrivacyPolicy from './components/PrivacyPolicy';
import Profile from './components/Profile';
import Footer from './components/Footer';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { Analytics } from '@vercel/analytics/react';
import './styles/animations.css';

// Version of the app - increment this when making major UI changes
const APP_VERSION = '2.0.1';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check if we need to force a reload for the new version
    const lastVersion = localStorage.getItem('appVersion');
    if (lastVersion !== APP_VERSION) {
      localStorage.setItem('appVersion', APP_VERSION);
      if (lastVersion) { // Only reload if there was a previous version
        window.location.reload();
        return;
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SubscriptionProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
          <RoutesComponent>
            <Route
              path="/"
              element={
                session ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LandingPage key="landing" />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                session ? (
                  <Dashboard key={session.user.id} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                session ? (
                  <Profile />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="/learn-more" element={<LearnMore onBack={() => {}} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </RoutesComponent>
          <Footer />
        </div>
      </Router>
      <Analytics />
    </SubscriptionProvider>
  );
}

export default App;
