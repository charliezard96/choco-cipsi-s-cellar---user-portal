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
import { CHOCOLATES, Chocolate, Producer } from './constants';
import { supabase } from './lib/supabase';
import { ArrowLeft } from 'lucide-react';

type View = 'encyclopedia' | 'detail' | 'producers' | 'tastings' | 'producerDetail' | 'profile' | 'community' | 'update-password';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('encyclopedia');
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);
  const [chocolates, setChocolates] = useState<Chocolate[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducers, setLoadingProducers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [retrying, setRetrying] = useState(0);

  useEffect(() => {
    async function fetchChocolates() {
      if (!supabase) {
        setLoading(false);
        setError('Configurazione Supabase mancante. Inserisci URL e API Key nei Secrets.');
        return;
      }

      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError('Connessione al database lenta. Riprova più tardi.');
        }
      }, 10000); // 10s timeout

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching from CHOCO_BARS with relations...');
        
        const { data, error: supabaseError, status } = await supabase
          .from('CHOCO_BARS')
          .select(`
            *,
            BAR_AROMA_RELATION (
              aroma_profiles (
                name
              )
            )
          `);

        clearTimeout(timeoutId);

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          if (supabaseError.code === 'PGRST116' || status === 401) {
            throw new Error('Permessi不足 (RLS). Controlla le Policies su Supabase.');
          }
          throw supabaseError;
        }

        if (data) {
          const mappedData: Chocolate[] = data.map((item: any) => {
            const relationNotes = item.BAR_AROMA_RELATION?.map((rel: any) => rel.aroma_profiles?.name).filter(Boolean) || [];
            
            return {
              id: String(item.id),
              name: item.name || 'Senza Nome',
              percentage: item.percentage ? `${item.percentage}%` : '0%',
              origin: item.origin || 'Origine Sconosciuta',
              tastingNotes: relationNotes.length > 0 ? relationNotes : (Array.isArray(item.notes) ? item.notes : []),
              imageUrl: item.image_url || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop',
              imageBars: item.image_bars || 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=800&auto=format&fit=crop',
              description: item.description || 'Nessuna descrizione disponibile.',
              producer: (item.brand || 'Produttore Ignoto').trim(),
              producerId: item.brand_id ? String(item.brand_id) : undefined,
              region: item.region || '',
              harvestYear: (String(item.harvest_year) || '2024').trim(),
              logoUrl: (item.logo_url || item.logo || item.brand_logo || item.icon || '').trim()
            };
          });
          setChocolates(mappedData);
          setError(null);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('Connection error:', err);
        setError(`Errore: ${err.message || 'Controlla la configurazione del DB'}`);
      } finally {
        setLoading(false);
      }
    }

    async function fetchProducers() {
      if (!supabase) return;
      try {
        setLoadingProducers(true);
        const { data, error: makerError } = await supabase
          .from('CHOCO_MAKERS')
          .select('*');
        
        if (makerError) throw makerError;

        if (data && data.length > 0) {
          console.log('Sample Maker Data:', data[0]);
          const mappedMakers: Producer[] = data.map((m: any) => {
            const makerId = m.id ? String(m.id) : (m.name || m.brand || Math.random().toString());
            return {
              id: makerId,
              name: (m.name || m.brand || 'Produttore Ignoto').trim(),
              location: m.location || m.origin || 'Sconosciuta',
              description: m.description || 'Pioniere del cioccolato bean-to-bar.',
              imageUrl: m.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
              tags: Array.isArray(m.tags) ? m.tags : ['Artigianale', 'Commercio Diretto'],
              verified: !!m.verified,
              philosophy: m.philosophy || '',
              specialFeature: m.special_feature || '',
              founders: m.founders || '',
              logoUrl: (m.logo_url || m.logo || m.brand_logo || m.icon || '').trim()
            };
          });
          setProducers(mappedMakers);
        }
      } catch (err) {
        console.error('Error fetching makers:', err);
      } finally {
        setLoadingProducers(false);
      }
    }

    fetchChocolates();
    fetchProducers();

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
  }, [retrying]);

  const handleRetry = () => setRetrying(prev => prev + 1);

  const handleSelectChocolate = (id: string) => {
    setSelectedChocolateId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProducer = (id: string) => {
    console.log('Selected Producer ID/Name:', id);
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
      
      {error && (
        <div className="bg-error-container text-on-error-container px-8 py-3 flex items-center justify-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
          <button 
            onClick={handleRetry}
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
            loading={loading}
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
            loading={loadingProducers}
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

