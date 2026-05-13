import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Verified, RefreshCw } from 'lucide-react';
import { OriginMap } from '../components/OriginMap';
import { usePageMeta } from '../hooks/usePageMeta';
import { Chocolate, AromaProfile, BarLevelTag } from '../types';
import { aromaService } from '../services/aromaService';
import { getIconHelper } from '../utils/iconUtils';
import { getAromaColors } from '../utils/colorUtils';

interface Props {
  chocolates: Chocolate[];
}

function buildGrouped(tags: BarLevelTag[], profiles: AromaProfile[]) {
  const map = new Map<string, { subgroups: string[]; hex_color: string | null; icon_slug: string | null }>();
  tags.forEach(tag => {
    if (!map.has(tag.group_name)) {
      const rep = profiles.find(p => p.group_name === tag.group_name);
      map.set(tag.group_name, { subgroups: [], hex_color: rep?.hex_color ?? null, icon_slug: rep?.icon_slug ?? null });
    }
    if (tag.subgroup_name) map.get(tag.group_name)!.subgroups.push(tag.subgroup_name);
  });
  return Array.from(map.entries()).map(([groupName, data]) => ({ groupName, ...data }));
}

const AromaColumn: React.FC<{ grouped: ReturnType<typeof buildGrouped>; profiles: AromaProfile[] }> = ({ grouped, profiles }) => {
  if (grouped.length === 0) return <p className="text-xs text-stone-300 italic">Nessun profilo aromatico.</p>;
  return (
    <div className="space-y-2">
      {grouped.map(({ groupName, subgroups, hex_color, icon_slug }) => {
        const colors = getAromaColors(hex_color);
        const GroupIcon = getIconHelper(icon_slug, groupName);
        return (
          <div key={groupName} className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: colors.bg }}>
              <GroupIcon size={13} strokeWidth={2.5} color={colors.fg} />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.fg }}>{groupName}</span>
            </div>
            {subgroups.length > 0 && (
              <div className="p-2 flex flex-wrap gap-1 bg-white/50">
                {subgroups.map(sub => {
                  const subRep = profiles.find(p => p.group_name === groupName && p.subgroup_name === sub);
                  const sc = getAromaColors(subRep?.hex_color ?? hex_color);
                  return (
                    <span key={sub} className="px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: sc.bg, borderColor: sc.border, color: sc.fg }}>{sub}</span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CompareView: React.FC<Props> = ({ chocolates }) => {
  usePageMeta('Confronto Tavolette');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const idA = params.get('a');
  const idB = params.get('b');
  const a = chocolates.find(c => c.id === idA);
  const b = chocolates.find(c => c.id === idB);

  const [profiles, setProfiles] = useState<AromaProfile[]>([]);
  const [tagsA, setTagsA] = useState<BarLevelTag[]>([]);
  const [tagsB, setTagsB] = useState<BarLevelTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idA || !idB) return;
    Promise.all([
      aromaService.fetchProfiles(),
      aromaService.fetchBarLevelTags(idA),
      aromaService.fetchBarLevelTags(idB),
    ]).then(([p, tA, tB]) => {
      setProfiles(p);
      setTagsA(tA);
      setTagsB(tB);
    }).catch(console.error).finally(() => setLoading(false));
  }, [idA, idB]);

  const groupedA = useMemo(() => buildGrouped(tagsA, profiles), [tagsA, profiles]);
  const groupedB = useMemo(() => buildGrouped(tagsB, profiles), [tagsB, profiles]);

  if (!a || !b) return (
    <div className="text-center py-20">
      <p className="text-stone-400 text-sm font-medium">Tavolette non trovate.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-xs font-bold text-secondary uppercase tracking-widest">
        Torna all'enciclopedia
      </button>
    </div>
  );

  const sharedFamilies = groupedA.map(g => g.groupName).filter(gn => groupedB.some(g => g.groupName === gn));

  const MetaRow: React.FC<{ label: string; va: string; vb: string }> = ({ label, va, vb }) => (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 py-4 border-b border-stone-50 last:border-0">
      <span className="text-sm font-bold text-primary text-right">{va || '—'}</span>
      <span className="w-28 text-center text-[9px] font-black text-stone-300 uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-sm font-bold text-primary">{vb || '—'}</span>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Torna indietro
      </button>

      <h1 className="text-2xl font-bold text-primary mb-1">Confronto</h1>
      <p className="text-xs text-stone-400 font-medium mb-10 uppercase tracking-widest">Analisi comparativa delle tavolette selezionate</p>

      {/* Hero images */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        {[a, b].map(bar => (
          <button key={bar.id} onClick={() => navigate(`/chocolate/${bar.id}`)} className="group text-left">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-50 mb-3">
              <img src={bar.imageUrl} alt={bar.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <span className="text-[9px] font-black text-secondary uppercase tracking-widest block">{bar.producer}</span>
            <span className="text-sm font-bold text-primary leading-tight block">{bar.name}</span>
          </button>
        ))}
      </div>

      {/* Mappe origine */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <OriginMap origin={a.origin} className="h-36" />
        <OriginMap origin={b.origin} className="h-36" />
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-10 mb-6">
        <MetaRow label="% Cacao" va={a.percentage} vb={b.percentage} />
        <MetaRow label="Origine" va={a.origin} vb={b.origin} />
        <MetaRow label="Regione" va={a.region} vb={b.region} />
      </div>

      {/* Aroma profiles */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-10 mb-6">
        <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest text-center mb-6">Profilo Aromatico d'Archivio</p>
        {loading ? (
          <div className="flex justify-center py-8"><RefreshCw size={20} className="animate-spin text-secondary" /></div>
        ) : (
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
            <AromaColumn grouped={groupedA} profiles={profiles} />
            <div className="w-px bg-stone-100 self-stretch mx-2" />
            <AromaColumn grouped={groupedB} profiles={profiles} />
          </div>
        )}
      </div>

      {/* Shared callouts */}
      {sharedFamilies.length > 0 && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 flex items-start gap-4">
          <Verified size={18} className="text-secondary shrink-0 mt-0.5" />
          <div className="space-y-3">
            {sharedFamilies.length > 0 && (
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Famiglie aromatiche condivise</p>
                <div className="flex flex-wrap gap-2">
                  {sharedFamilies.map(fn => {
                    const rep = profiles.find(p => p.group_name === fn);
                    const colors = getAromaColors(rep?.hex_color);
                    const Icon = getIconHelper(rep?.icon_slug ?? null, fn);
                    return (
                      <div key={fn} className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
                        style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                        <Icon size={11} color={colors.fg} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.fg }}>{fn}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

