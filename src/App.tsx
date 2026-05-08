import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EncyclopediaView } from './views/Encyclopedia';
import { DetailView } from './views/DetailView';
import { ProducersView } from './views/Producers';
import { ProducerDetailView } from './views/ProducerDetailView';
import { TastingsView } from './views/Tastings';
import { ProfileView } from './views/ProfileView';
import { CommunityView } from './views/Community';
import { UpdatePasswordView } from './views/UpdatePassword';
import { AuthCallback } from './views/AuthCallback';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';
import { useChocolates } from './hooks/useChocolates';
import { useProducers } from './hooks/useProducers';
import { findProducerForChocolate, getChocolatesByProducer } from './utils/matchUtils';

type View =
  | 'encyclopedia' | 'detail' | 'producers' | 'producerDetail'
  | 'tastings' | 'profile' | 'community'
  | 'update-password' | 'auth-callback';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('encyclopedia');
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);

  const { chocolates, loading: chocoLoading, error: chocoError, retry: retryChocolates } = useChocolates();
  const { producers, loading: producersLoading } = useProducers();

  /* ── Auth events & deep link handling ── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') setCurrentView('update-password');
    });

    if (window.location.pathname === '/update-password') {
      setCurrentView('update-password');
    } else if (window.location.pathname === '/auth-callback' || window.location.hash.includes('access_token')) {
      setCurrentView('auth-callback');
    }

    return () => { subscription.unsubscribe(); };
  }, []);

  /* ── Navigation helpers ── */
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const navigate = (view: View) => {
    setCurrentView(view);
    setSelectedChocolateId(null);
    setSelectedProducerId(null);
    scrollTop();
  };

  const selectChocolate = (id: string) => {
    setSelectedChocolateId(id);
    setCurrentView('detail');
    scrollTop();
  };

  const selectProducer = (id: string) => {
    setSelectedProducerId(id);
    setCurrentView('producerDetail');
    scrollTop();
  };

  const goBack = () => navigate('encyclopedia');

  /* ── Derived state (usa le utility centralizzate) ── */
  const activeChocolate = chocolates.find(c => c.id === selectedChocolateId);
  const activeProducer = producers.find(p =>
    selectedProducerId && (p.id === selectedProducerId || p.name === selectedProducerId)
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-secondary-container selection:text-on-secondary-container">
      <Header currentView={currentView} onNavigate={navigate} />

      {chocoError && (
        <div className="bg-error-container text-on-error-container px-8 py-3 flex items-center justify-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest">{chocoError}</span>
          <button
            onClick={retryChocolates}
            className="bg-on-error-container text-error-container px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded hover:opacity-80 transition-opacity"
          >
            Riprova
          </button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-8 py-12 w-full">
        {currentView === 'encyclopedia' && (
          <EncyclopediaView onSelect={selectChocolate} chocolates={chocolates} loading={chocoLoading} />
        )}

        {currentView === 'detail' && activeChocolate && (
          <DetailView
            chocolate={activeChocolate}
            onBack={goBack}
            onSelectProducer={selectProducer}
            producerLogoUrl={findProducerForChocolate(activeChocolate, producers)?.logoUrl}
          />
        )}

        {currentView === 'producers' && (
          <ProducersView producers={producers} loading={producersLoading} onSelectProducer={selectProducer} />
        )}

        {currentView === 'producerDetail' && activeProducer && (
          <ProducerDetailView
            producer={activeProducer}
            onBack={() => { setCurrentView('producers'); setSelectedProducerId(null); }}
            brandBars={getChocolatesByProducer(activeProducer, chocolates)}
            onSelectChocolate={selectChocolate}
          />
        )}

        {currentView === 'tastings' && <TastingsView />}
        {currentView === 'profile' && <ProfileView chocolates={chocolates} onSelectChocolate={selectChocolate} />}
        {currentView === 'community' && <CommunityView chocolates={chocolates} onSelectChocolate={selectChocolate} />}
        {currentView === 'update-password' && <UpdatePasswordView onComplete={() => navigate('encyclopedia')} />}
        {currentView === 'auth-callback' && <AuthCallback />}
      </main>

      <AuthModal />
      <Footer onNavigate={navigate} />
    </div>
  );
}