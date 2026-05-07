import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';
import { 
  User, Save, MapPin, AlignLeft, RefreshCw, Star, X, 
  ChevronLeft, ChevronRight, BookOpen, Camera, Loader2,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chocolate, AromaProfile } from '../types';
import { getIconHelper } from '../utils/iconUtils';
import { aromaService } from '../services/aromaService';
import { ratingService } from '../services/ratingService';

interface ProfileViewProps {
  chocolates: Chocolate[];
  onSelectChocolate: (id: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ chocolates, onSelectChocolate }) => {
  const { profile, user, loading, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [userAromaVotes, setUserAromaVotes] = useState<any[]>([]);
  const [aromaProfiles, setAromaProfiles] = useState<AromaProfile[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        name: profile.name || '',
        surname: profile.surname || '',
        aboutMe: profile.aboutMe || '',
        favouriteOrigin: profile.favouriteOrigin || ''
      });
      fetchUserRatings();
      fetchUserAromaVotes();
      fetchAromaProfiles();
    }
  }, [profile]);

  const fetchAromaProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('aroma_profiles')
        .select('*');
      if (error) throw error;
      setAromaProfiles(data || []);
    } catch (e) {
      console.error('fetchAromaProfiles error:', e);
    }
  };

  const fetchUserAromaVotes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('chocolate_aroma_votes')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setUserAromaVotes(data || []);
    } catch (e) {
      console.error('fetchUserAromaVotes error:', e);
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setStatusMsg({ text: 'Avatar aggiornato!', type: 'success' });
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Caricamento fallito: ${error.message || 'Controlla se il bucket "avatars" esiste e se le policy sono impostate.'}`);
    } finally {
      setUploading(false);
    }
  };

  const fetchUserRatings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setUserRatings(data || []);
    } catch (e) {
      console.error('fetchUserRatings error:', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          name: formData.name,
          surname: formData.surname,
          about_me: formData.aboutMe,
          favourite_origin: formData.favouriteOrigin
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setStatusMsg({ text: 'Profilo aggiornato!', type: 'success' });
    } catch (error: any) {
      console.error('Profile update error:', error);
      setStatusMsg({ text: 'Aggiornamento fallito.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };



  const aromaVotesByChocolate = userAromaVotes.reduce((acc, vote) => {
    if (!acc[vote.chocolate_id]) acc[vote.chocolate_id] = [];
    acc[vote.chocolate_id].push(vote);
    return acc;
  }, {} as Record<string, any[]>);

  const enrichedRatings = userRatings.map(rating => {
    const chocolate = chocolates.find(c => c.id === String(rating.chocolate_id));
    return {
      ...rating,
      chocolateDetails: chocolate
    };
  }).filter(r => r.chocolateDetails);

  const totalPages = Math.ceil(enrichedRatings.length / itemsPerPage);
  const paginatedRatings = enrichedRatings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-surface-container rounded-3xl border border-primary/10">
        <User size={48} className="mx-auto text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-primary mb-2">Accesso Archivio Privato</h2>
        <p className="text-on-surface-variant max-w-md mx-auto mb-8">
          I profili personali degli intenditori sono riservati ai membri. Accedi per gestire la tua collezione.
        </p>
      </div>
    );
  }

  return (
    <div id="profile-view" className="animate-in fade-in duration-700 max-w-4xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="relative group">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleUploadAvatar}
          />
          <button 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer ring-offset-4 ring-primary/5 hover:ring-primary/20 transition-all rounded-3xl overflow-hidden"
          >
            {profile?.photoURL ? (
              <img src={profile.photoURL} className="w-32 h-32 rounded-3xl shadow-xl border-4 border-white object-cover" alt="Avatar" />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border-4 border-white">
                <User size={48} strokeWidth={1.5} />
              </div>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <Loader2 className="text-white animate-spin" size={24} />
              ) : (
                <Camera className="text-white" size={24} />
              )}
            </div>
          </button>
        </div>
        <div className="flex-1 py-2">
          <h1 className="text-4xl font-serif italic text-primary mb-2">
            {formData.name || formData.surname ? `${formData.name} ${formData.surname}`.trim() : 'Intenditore senza nome'}
          </h1>
          {formData.username && (
            <p className="text-secondary font-mono text-sm mb-2">@{formData.username}</p>
          )}
          <p className="text-on-surface-variant font-medium uppercase tracking-[0.2em] text-xs">Gestore della Collezione</p>
          <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-surface-container px-4 py-2 rounded-full border border-primary/5 flex items-center gap-2 hover:bg-stone-200 transition-colors shadow-sm active:scale-95 group"
            >
              <Star className="text-secondary w-4 h-4 fill-secondary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-primary">{userRatings.length} Valutazioni</span>
            </button>
            <div className="bg-surface-container px-4 py-2 rounded-full border border-primary/5 flex items-center gap-2">
              <MapPin className="text-stone-400 w-4 h-4" />
              <span className="text-xs font-bold text-stone-600">{formData.favouriteOrigin || 'Nessuna origine definita'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Ratings Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Star className="text-secondary fill-secondary" size={20} />
                    La Mia Collezione Valutata
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">Rivedi la tua cronologia delle degustazioni</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {enrichedRatings.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
                      <BookOpen className="text-stone-300" size={32} />
                    </div>
                    <p className="text-stone-500 font-medium italic">Nessuna voce ancora presente nel tuo archivio personale.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedRatings.map((rating) => (
                      <motion.button
                        key={rating.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                          setIsModalOpen(false);
                          onSelectChocolate(rating.chocolateDetails.id);
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container border border-transparent hover:border-primary/5 transition-all text-left"
                      >
                        <img 
                          src={rating.chocolateDetails.imageUrl} 
                          className="w-16 h-16 rounded-xl object-cover shadow-sm bg-stone-100" 
                          alt={rating.chocolateDetails.name}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-tighter text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                              {rating.chocolateDetails.producer}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                              {rating.chocolateDetails.origin}
                            </span>
                          </div>
                          <h4 className="font-serif italic text-primary truncate">
                            {rating.chocolateDetails.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-stone-100 shadow-sm">
                          <Star size={12} className="text-secondary fill-secondary" />
                          <span className="text-sm font-black text-primary">{rating.rating}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-400 uppercase tracking-widest">
                    Pagina {currentPage} di {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="p-2 bg-white rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-100 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="p-2 bg-white rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-100 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <section className="bg-white p-8 rounded-3xl border border-primary/10 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-8 flex items-center gap-3">
              <User size={20} className="text-secondary" />
              Impostazioni Profilo
            </h2>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-2">Nome</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-2">Cognome</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium"
                        value={formData.surname || ''}
                        onChange={e => setFormData({...formData, surname: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-stone-400">@</span>
                    <input 
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium"
                      value={formData.username || ''}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-2">Origine di Produzione Preferita</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      placeholder="es. Chuao, Venezuela"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium"
                      value={formData.favouriteOrigin || ''}
                      onChange={e => setFormData({...formData, favouriteOrigin: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-2">Su di Me</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-stone-400" />
                    <textarea 
                      rows={4}
                      placeholder="Condividi il tuo percorso di degustazione..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium resize-none"
                      value={formData.aboutMe || ''}
                      onChange={e => setFormData({...formData, aboutMe: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save size={18} />}
                {saving ? 'Salvataggio...' : 'Aggiorna Profilo Intenditore'}
              </button>

              {statusMsg && (
                <p className={`text-center text-[10px] font-bold uppercase tracking-widest ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {statusMsg.text}
                </p>
              )}
            </form>
          </section>
        </div>

        <div>
          <section className="bg-surface-container p-8 rounded-3xl border border-primary/5">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-primary/10 pb-4">Analisi Attività</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant font-medium">Collezioni Esplorate</span>
                <span className="text-sm font-bold text-primary">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant font-medium">Valutazioni Fornite</span>
                <span className="text-sm font-bold text-primary">{userRatings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant font-medium">Membro dal</span>
                <span className="text-sm font-bold text-primary">Maggio 2024</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-white/50 rounded-xl border border-white">
              <p className="text-[10px] text-stone-500 italic text-center">
                "Il cioccolato è l'unica aromaterapia di cui ho bisogno."
              </p>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-12 bg-white p-8 rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
         <div className="flex items-center gap-2 mb-8">
            <Fingerprint size={24} className="text-secondary" />
            <h3 className="text-lg font-bold text-primary uppercase tracking-widest">Le Mie Note Aromatiche</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(aromaVotesByChocolate).length === 0 ? (
               <div className="md:col-span-2 lg:col-span-3 py-16 text-center border border-dashed border-stone-100 rounded-3xl">
                  <Fingerprint size={48} className="text-stone-100 mx-auto mb-4" />
                  <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">
                     Nessun voto aromatico registrato
                  </p>
               </div>
            ) : (
               Object.keys(aromaVotesByChocolate).map(chocId => {
                  const chocolate = chocolates.find(c => c.id === chocId);
                  const votes = aromaVotesByChocolate[chocId];
                  return (
                     <div key={chocId} className="space-y-4 p-6 bg-stone-50/50 rounded-2xl border border-stone-100 group hover:border-secondary/20 transition-all">
                        <button 
                           onClick={() => onSelectChocolate(chocId)}
                           className="text-left w-full"
                        >
                           <div className="flex items-center gap-3 mb-2">
                             {chocolate?.imageUrl && (
                               <img src={chocolate.imageUrl} className="w-10 h-10 rounded-lg object-cover shadow-sm bg-white" alt="" />
                             )}
                             <div>
                               <span className="text-xs font-black text-secondary uppercase tracking-[0.1em] block group-hover:text-primary transition-colors">
                                  {chocolate?.name || 'Tavoletta Sconosciuta'}
                               </span>
                               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                                  {chocolate?.producer}
                               </span>
                             </div>
                           </div>
                        </button>
                        <div className="flex flex-wrap gap-2">
                           {votes.map(v => {
                              const profile = aromaProfiles.find(p => p.id === v.aroma_id);
                              if (!profile) return null;
                              const Icon = getIconHelper(profile.icon_slug, profile.group_name);
                              return (
                                 <div 
                                    key={v.id}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all hover:scale-105"
                                    style={{ 
                                      backgroundColor: profile.hex_color ? `${profile.hex_color}15` : '#f3f4f6',
                                      borderColor: profile.hex_color ? `${profile.hex_color}50` : '#e5e7eb'
                                    }}
                                 >
                                    <Icon size={12} color={profile.hex_color || undefined} />
                                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                                       {profile.name}
                                    </span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      </section>
    </div>
  );
};
