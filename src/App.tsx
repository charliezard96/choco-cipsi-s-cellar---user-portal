import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EncyclopediaView } from './views/Encyclopedia';
import { DetailView } from './views/DetailView';
import { ProducersView } from './views/Producers';
import { ProducerDetailView } from './views/ProducerDetailView';
import { TastingsView } from './views/Tastings';
import { ProfileView } from './views/ProfileView';
import { MyCellarView } from './views/MyCellarView';
import { CommunityView } from './views/Community';
import { UpdatePasswordView } from './views/UpdatePassword';
import { AuthCallback } from './views/AuthCallback';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';
import { useChocolates } from './hooks/useChocolates';
import { useProducers } from './hooks/useProducers';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chocolates, loading: chocoLoading, error: chocoError, retry: retryChocolates } = useChocolates();
  const { producers, loading: producersLoading } = useProducers();

  /* ── Auth events ── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/update-password');
    });
    return () => { subscription.unsubscribe(); };
  }, [navigate]);

  /* ── Scroll to top on route change ── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-secondary-container selection:text-on-secondary-container">
      <Header />

      {chocoError && (
        <div className="bg-error-container text-on-error-container px-8 py-3 flex items-center justify-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest">{chocoError}</span>
          <button onClick={retryChocolates}
            className="bg-on-error-container text-error-container px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded hover:opacity-80 transition-opacity">
            Riprova
          </button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-8 py-12 w-full">
        <Routes>
          <Route path="/" element={
            <EncyclopediaView chocolates={chocolates} loading={chocoLoading} />
          } />
          <Route path="/chocolate/:id" element={
            <DetailView chocolates={chocolates} producers={producers} loading={chocoLoading} />
          } />
          <Route path="/producers" element={
            <ProducersView producers={producers} loading={producersLoading} />
          } />
          <Route path="/producers/:id" element={
            <ProducerDetailView producers={producers} chocolates={chocolates} />
          } />
          <Route path="/tastings" element={<TastingsView />} />
          <Route path="/profile" element={
            <ProfileView chocolates={chocolates} />
          } />
          <Route path="/my-cellar" element={
            <MyCellarView chocolates={chocolates} />
          } />
          <Route path="/community" element={
            <CommunityView chocolates={chocolates} />
          } />
          <Route path="/update-password" element={
            <UpdatePasswordView onComplete={() => navigate('/')} />
          } />
          <Route path="/auth-callback" element={<AuthCallback />} />
          {/* Fallback: redirect to home */}
          <Route path="*" element={<EncyclopediaView chocolates={chocolates} loading={chocoLoading} />} />
        </Routes>
      </main>

      <AuthModal />
      <Footer />
    </div>
  );
}