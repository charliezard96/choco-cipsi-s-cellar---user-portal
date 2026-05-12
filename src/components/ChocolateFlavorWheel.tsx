import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AromaProfile } from '../types';
import { aromaService } from '../services/aromaService';
import { getIconHelper } from '../utils/iconUtils';
import { ensureVisible } from '../utils/colorUtils';
import { RefreshCw, Radar, Info } from 'lucide-react';

/* ── Types ── */
interface Props {
  chocolateId: string;
  profiles: AromaProfile[];
  refreshTrigger?: number;
}

interface TreeItem {
  name: string;
  value: number;
  hex_color: string;
  group_name: string;
  subgroup_name: string;
}

interface SubgroupData {
  name: string;
  value: number;
  hex_color: string;
  children: TreeItem[];
}

interface GroupData {
  name: string;
  value: number;
  hex_color: string;
  subgroups: Record<string, SubgroupData>;
}

/* ── Tooltip ── */
const WheelTooltip: React.FC<{ active?: boolean; payload?: any[]; profiles: AromaProfile[] }> = ({ active, payload, profiles }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const profile = profiles.find(p => p.name === d.name);
  const Icon = getIconHelper(profile?.icon_slug || null, profile?.group_name || d.name);
  const visibleColor = ensureVisible(d.hex_color);

  return (
    <div className="bg-white p-3 rounded-xl shadow-xl border border-stone-100 animate-in fade-in zoom-in duration-200">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} color={visibleColor} />
        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{d.name}</p>
      </div>
      <div className="flex items-center gap-2 ml-5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: visibleColor }} />
        <p className="text-[10px] font-bold text-secondary">{d.value} {d.value === 1 ? 'voto' : 'voti'}</p>
      </div>
    </div>
  );
};

/* ── Main Component ── */
export const ChocolateFlavorWheel: React.FC<Props> = ({ chocolateId, profiles, refreshTrigger }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const [wheelSize, setWheelSize] = useState(500);

  useEffect(() => {
    const update = () => {
      if (wheelRef.current) setWheelSize(Math.min(wheelRef.current.offsetWidth, 500));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await aromaService.fetchAromaStats(chocolateId);
      const aggregated = (data || [])
        .map(row => {
          const profile = profiles.find(p => p.id === row.aroma_id);
          return {
            ...profile,
            total_votes: row.total_votes,
            group_name: row.group_name || profile?.group_name,
            subgroup_name: row.subgroup_name || profile?.subgroup_name || row.group_name || profile?.group_name,
            name: row.name || profile?.name,
            hex_color: row.hex_color || profile?.hex_color,
          };
        })
        .filter(p => p.name);
      setStats(aggregated);
    } catch (e) {
      console.error('[FlavorWheel] fetchStats error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [chocolateId, refreshTrigger, profiles]);

  const { innerData, midData, outerData, hasData } = useMemo(() => {
    if (stats.length === 0) return { innerData: [], midData: [], outerData: [], hasData: false };

    const groupMap: Record<string, GroupData> = {};
    stats.forEach(s => {
      const gName = s.group_name || 'Altro';
      const sgName = s.subgroup_name || gName;
      if (!groupMap[gName]) groupMap[gName] = { name: gName, value: 0, hex_color: s.hex_color || '#e5e7eb', subgroups: {} };
      if (!groupMap[gName].subgroups[sgName]) groupMap[gName].subgroups[sgName] = { name: sgName, value: 0, hex_color: s.hex_color || '#f3f4f6', children: [] };
      groupMap[gName].subgroups[sgName].value += s.total_votes;
      groupMap[gName].subgroups[sgName].children.push({ name: s.name!, value: s.total_votes, hex_color: s.hex_color || '#f3f4f6', group_name: gName, subgroup_name: sgName });
    });

    const inner: any[] = [], mid: any[] = [], outer: any[] = [];
    Object.values(groupMap).sort((a, b) => b.value - a.value).forEach(g => {
      let total = 0;
      Object.values(g.subgroups).sort((a, b) => b.value - a.value).forEach(sg => {
        total += sg.value;
        mid.push(sg);
        sg.children.sort((a, b) => b.value - a.value).forEach(note => outer.push(note));
      });
      inner.push({ ...g, value: total });
    });

    return { innerData: inner, midData: mid, outerData: outer, hasData: true };
  }, [stats]);

  if (loading && !hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-stone-300">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Sincronizzazione spettro sensoriale...</span>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-dashed border-stone-100 text-center relative overflow-hidden group">
        <Radar size={120} className="text-stone-50 absolute -bottom-4 -right-4 opacity-50 rotate-12 transition-transform group-hover:scale-110" />
        <Radar size={48} className="text-stone-200 mb-6" />
        <p className="text-sm font-black text-primary uppercase tracking-widest mb-2 z-10">Ancora nessun voto per questa tavoletta</p>
        <button onClick={fetchStats} className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] hover:opacity-70 transition-all z-10">
          Sii il primo a votare!
        </button>
      </div>
    );
  }

  const GOLD = '#D4AF37';
  const s = wheelSize / 500;
  const pieLayers = [
    { data: innerData, inner: 65 * s, outer: 105 * s, pad: 3, corner: 8 * s, stroke: 1.5, opacity: 0.95 },
    { data: midData, inner: 112 * s, outer: 155 * s, pad: 2, corner: 6 * s, stroke: 1, opacity: 0.8 },
    { data: outerData, inner: 162 * s, outer: 210 * s, pad: 1, corner: 4 * s, stroke: 0.8, opacity: 0.6 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 bg-white p-4 sm:p-8 lg:p-12 rounded-[40px] shadow-sm border border-stone-50">
      {/* Sidebar */}
      <div className="w-full lg:w-1/3 space-y-8">
        <div>
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Info size={14} className="text-secondary" /> Analisi dello Spettro
          </h3>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {innerData.map(group => {
              const totalVotes = innerData.reduce((acc, c) => acc + c.value, 0);
              const pct = Math.round((group.value / totalVotes) * 100);
              return (
                <div key={group.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.hex_color }} />
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider">{group.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-secondary font-bold">{pct}%</span>
                  </div>
                  <div className="pl-4 space-y-2 border-l border-stone-100 ml-1">
                    {Object.values(group.subgroups as Record<string, SubgroupData>)
                      .sort((a, b) => b.value - a.value)
                      .map(sg => (
                        <div key={sg.name} className="flex items-center justify-between group/item">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest group-hover/item:text-stone-600 transition-colors">{sg.name}</span>
                          <span className="text-[9px] font-mono text-stone-500">{Math.round((sg.value / totalVotes) * 100)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="pt-6 border-t border-stone-50">
          <p className="text-[9px] text-stone-400 leading-relaxed italic">
            I dati riflettono l'esperienza sensoriale collettiva della nostra community di degustatori esperti.
          </p>
        </div>
      </div>

      {/* Wheel */}
      <div ref={wheelRef} className="flex-1 w-full relative group flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-24 h-24 rounded-full bg-stone-50/10 flex flex-col items-center justify-center border border-stone-100/30 group-hover:scale-105 transition-transform duration-700 ease-out">
            <Radar className="text-secondary opacity-20 mb-0.5" size={24} />
            <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest leading-none">Aroma Map</span>
          </div>
        </div>
        <div style={{ width: wheelSize, height: wheelSize }} className="relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<WheelTooltip profiles={profiles} />} wrapperStyle={{ zIndex: 100 }} />
              {pieLayers.map((layer, li) => (
                <Pie key={li} data={layer.data} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={layer.inner} outerRadius={layer.outer} paddingAngle={layer.pad}
                  cornerRadius={layer.corner} isAnimationActive>
                  {layer.data.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.hex_color} fillOpacity={layer.opacity} stroke={GOLD} strokeWidth={layer.stroke}
                      className="hover:opacity-100 transition-opacity cursor-pointer focus:outline-none" />
                  ))}
                </Pie>
              ))}
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute -bottom-6 w-full text-center">
          <p className="text-[10px] text-stone-300 font-bold uppercase tracking-[0.2em]">Spettro Sensoriale della Community</p>
        </div>
      </div>
    </div>
  );
};