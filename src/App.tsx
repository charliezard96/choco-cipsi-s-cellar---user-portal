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
import { AuthModal } from './components/AuthModal';
import { Chocolate, Producer } from './types';
import { supabase } from './lib/supabase';
import { useChocolates } from './hooks/useChocolates';
import { useProducers } from './hooks/useProducers';

type View = 'encyclopedia' | 'detail' | 'producers' | 'tastings' | 'producerDetail' | 'profile' | 'community' | 'update-password';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('encyclopedia');
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);

  const { chocolates, loading: chocoLoading, error: chocoError, retry: retryChocolates } = useChocolates();
  const { producers, loading: producersLoading } = useProducers();

  useEffect(() => {
    // Listen for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('update-password');
      }
    });

    // Also check current URL for bypass (development/direct links)
    if (window.location.pathname === '/update-password') {
      setCurrentView('update-password');
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSelectChocolate = (id: string) => {
    setSelectedChocolateId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProducer = (id: string) => {
    setSelectedProducerId(id);
    setCurrentView('producerDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentView('encyclopedia');
    setSelectedChocolateId(null);
    setSelectedProducerId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeChocolate = chocolates.find(c => c.id === selectedChocolateId);
  const activeProducer = producers.find(p => 
    selectedProducerId && (p.id === selectedProducerId || p.name === selectedProducerId)
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-secondary-container selection:text-on-secondary-container">
      <Header 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view as View);
          setSelectedChocolateId(null);
          setSelectedProducerId(null);
        }} 
      />
      
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
          <EncyclopediaView 
            onSelect={handleSelectChocolate} 
            chocolates={chocolates}
            loading={chocoLoading}
          />
        )}
        
        {currentView === 'detail' && activeChocolate && (
          <DetailView 
            chocolate={activeChocolate} 
            onBack={handleBack} 
            onSelectProducer={handleSelectProducer}
            producerLogoUrl={producers.find(p => 
              (activeChocolate.producerId && p.id === activeChocolate.producerId) ||
              (!activeChocolate.producerId && (
                p.name.toLowerCase() === activeChocolate.producer.toLowerCase() ||
                activeChocolate.producer.toLowerCase().includes(p.name.toLowerCase()) ||
                p.name.toLowerCase().includes(activeChocolate.producer.toLowerCase())
              ))
            )?.logoUrl}
          />
        )}
        
        {currentView === 'producers' && (
          <ProducersView 
            producers={producers} 
            loading={producersLoading}
            onSelectProducer={handleSelectProducer} 
          />
        )}

        {currentView === 'producerDetail' && activeProducer && (
          <ProducerDetailView 
            producer={activeProducer}
            onBack={() => {
              setCurrentView('producers');
              setSelectedProducerId(null);
            }}
            brandBars={chocolates.filter(c => 
              (c.producerId && c.producerId === activeProducer.id) ||
              (!c.producerId && (
                c.producer.toLowerCase() === activeProducer.name.toLowerCase() ||
                c.producer.toLowerCase().includes(activeProducer.name.toLowerCase()) ||
                activeProducer.name.toLowerCase().includes(c.producer.toLowerCase())
              ))
            )}
            onSelectChocolate={handleSelectChocolate}
          />
        )}
        
        {currentView === 'tastings' && (
          <TastingsView />
        )}

        {currentView === 'profile' && (
          <ProfileView 
            chocolates={chocolates} 
            onSelectChocolate={handleSelectChocolate} 
          />
        )}

        {currentView === 'community' && (
          <CommunityView 
            chocolates={chocolates} 
            onSelectChocolate={handleSelectChocolate} 
          />
        )}

        {currentView === 'update-password' && (
          <UpdatePasswordView onComplete={() => setCurrentView('encyclopedia')} />
        )}
      </main>

      <AuthModal />
      <Footer />
    </div>
  );
}

