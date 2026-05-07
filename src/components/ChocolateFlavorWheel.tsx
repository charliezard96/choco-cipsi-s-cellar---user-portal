import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { supabase } from '../lib/supabase';
import { AromaProfile } from '../types';
import { aromaService } from '../services/aromaService';
import { getIconHelper } from '../utils/iconUtils';
import { RefreshCw, Radar, Info } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ChocolateFlavorWheelProps {
  chocolateId: string;
  profiles: AromaProfile[];
  refreshTrigger?: number;
}

interface TreeDataItem {
  name: string;
  value: number;
  hex_color: string;
  group_name: string;
  subgroup_name: string;
}

interface MidGroupedData {
  name: string;
  value: number;
  hex_color: string;
  children: TreeDataItem[];
}

interface GroupedData {
  name: string;
  value: number;
  hex_color: string;
  subgroups: Record<string, MidGroupedData>;
}

export const ChocolateFlavorWheel: React.FC<ChocolateFlavorWheelProps> = ({ 
  chocolateId, 
  profiles, 
  refreshTrigger 
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await aromaService.fetchAromaStats(chocolateId);
      
      // Map view data to the format expected by the wheel
      const aggregated = (data || []).map(row => {
        const profile = profiles.find(p => p.id === row.aroma_id);
        return {
          ...profile,
          total_votes: row.total_votes,
          group_name: row.group_name || profile?.group_name,
          subgroup_name: row.subgroup_name || profile?.subgroup_name || row.group_name || profile?.group_name,
          name: row.name || profile?.name,
          hex_color: row.hex_color || profile?.hex_color
        };
      }).filter(p => p.name);

      setStats(aggregated);
    } catch (e) {
      console.error('fetchStats error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [chocolateId, refreshTrigger, profiles]);

  const { innerData, midData, outerData, hasData } = useMemo(() => {
    if (stats.length === 0) {
      return { innerData: [], midData: [], outerData: [], hasData: false };
    }

    const groupMap: Record<string, GroupedData> = {};

    stats.forEach(s => {
      const gName = s.group_name || 'Altro';
      const sgName = s.subgroup_name || gName;

      if (!groupMap[gName]) {
        groupMap[gName] = {
          name: gName,
          value: 0,
          hex_color: s.hex_color || '#e5e7eb',
          subgroups: {}
        };
      }
      groupMap[gName].subgroups[sgName] = groupMap[gName].subgroups[sgName] || {
        name: sgName,
        value: 0,
        hex_color: s.hex_color || '#f3f4f6',
        children: []
      };

      groupMap[gName].subgroups[sgName].value += s.total_votes;
      groupMap[gName].subgroups[sgName].children.push({
        name: s.name!,
        value: s.total_votes,
        hex_color: s.hex_color || '#f3f4f6',
        group_name: gName,
        subgroup_name: sgName
      });
    });

    // Flatten to Recharts friendly arrays
    const inner: any[] = [];
    const mid: any[] = [];
    const outer: any[] = [];

    Object.values(groupMap).sort((a, b) => b.value - a.value).forEach(g => {
      let groupTotal = 0;
      Object.values(g.subgroups).sort((a, b) => b.value - a.value).forEach(sg => {
        groupTotal += sg.value;
        mid.push(sg);
        sg.children.sort((a, b) => b.value - a.value).forEach(note => {
          outer.push(note);
        });
      });
      inner.push({ ...g, value: groupTotal });
    });

    return { innerData: inner, midData: mid, outerData: outer, hasData: true };
  }, [stats, profiles]);



  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const profile = profiles.find(p => p.name === data.name) || {};
      const IconComp = getIconHelper((profile as any).icon_slug || null, (profile as any).group_name || data.name);

      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-stone-100 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-2 mb-1">
            <IconComp size={14} color={data.hex_color} />
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{data.name}</p>
          </div>
          <div className="flex items-center gap-2 ml-5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.hex_color }} />
            <p className="text-[10px] font-bold text-secondary">{data.value} {data.value === 1 ? 'voto' : 'voti'}</p>
          </div>
        </div>
      );
    }
    return null;
  };

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
        <Radar size={120} className="text-stone-50 mb-4 absolute -bottom-4 -right-4 opacity-50 rotate-12 transition-transform group-hover:scale-110" />
        <Radar size={48} className="text-stone-200 mb-6" />
        <p className="text-sm font-black text-primary uppercase tracking-widest mb-2 z-10">Ancora nessun voto per questa tavoletta</p>
        <button 
          onClick={fetchStats}
          className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] hover:opacity-70 transition-all z-10"
        >
          Sii il primo a votare!
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 bg-white p-8 lg:p-12 rounded-[40px] shadow-sm border border-stone-50">
      {/* Left Sidebar: Detailed Stats */}
      <div className="w-full lg:w-1/3 space-y-8">
        <div>
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Info size={14} className="text-secondary" />
            Analisi dello Spettro
          </h3>
          
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {innerData.map((group, idx) => {
              const totalVotes = innerData.reduce((acc, curr) => acc + curr.value, 0);
              const groupPercent = Math.round((group.value / totalVotes) * 100);
              
              return (
                <div key={group.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.hex_color }} />
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider">{group.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-secondary font-bold">{groupPercent}%</span>
                  </div>
                  
                  <div className="pl-4 space-y-2 border-l border-stone-100 ml-1">
                    {Object.values(group.subgroups as Record<string, MidGroupedData>)
                      .sort((a, b) => b.value - a.value)
                      .map((subgroup) => {
                        const subgroupPercent = Math.round((subgroup.value / totalVotes) * 100);
                        return (
                          <div key={subgroup.name} className="flex items-center justify-between group/item">
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest group-hover/item:text-stone-600 transition-colors">
                              {subgroup.name}
                            </span>
                            <span className="text-[9px] font-mono text-stone-300">{subgroupPercent}%</span>
                          </div>
                        );
                      })}
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

      {/* Right Side: Visual Wheel */}
      <div className="flex-1 relative group flex items-center justify-center min-h-[500px]">
        {/* Centered Aroma Map Info */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
           <div className="w-24 h-24 rounded-full bg-stone-50/10 flex flex-col items-center justify-center border border-stone-100/30 group-hover:scale-105 transition-transform duration-700 ease-out">
              <Radar className="text-secondary opacity-20 mb-0.5" size={24} />
              <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest leading-none">Aroma Map</span>
           </div>
        </div>
        
        <div className="w-[500px] h-[500px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                content={<CustomTooltip />} 
                wrapperStyle={{ zIndex: 100 }}
              />
            
            {/* Level 1: Groups (Inmost) - Thicker and Golden */}
            <Pie
              data={innerData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={105}
              paddingAngle={3}
              cornerRadius={8}
              isAnimationActive={true}
            >
              {innerData.map((entry, index) => (
                <Cell 
                  key={`cell-inner-${index}`} 
                  fill={entry.hex_color} 
                  fillOpacity={0.95}
                  stroke="#D4AF37"
                  strokeWidth={1.5}
                  className="hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
                />
              ))}
            </Pie>
  
            {/* Level 2: Subgroups (Middle) - Thicker and Rounded */}
            <Pie
              data={midData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={112}
              outerRadius={155}
              paddingAngle={2}
              cornerRadius={6}
              isAnimationActive={true}
            >
              {midData.map((entry, index) => (
                <Cell 
                  key={`cell-mid-${index}`} 
                  fill={entry.hex_color} 
                  fillOpacity={0.8}
                  stroke="#D4AF37"
                  strokeWidth={1}
                  className="hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
                />
              ))}
            </Pie>
  
            {/* Level 3: Individual Notes (Outmost) - Golden Borders */}
            <Pie
              data={outerData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={162}
              outerRadius={210}
              paddingAngle={1}
              cornerRadius={4}
              isAnimationActive={true}
            >
              {outerData.map((entry, index) => (
                <Cell 
                  key={`cell-outer-${index}`} 
                  fill={entry.hex_color} 
                  fillOpacity={0.6}
                  stroke="#D4AF37"
                  strokeWidth={0.8}
                  className="hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
                />
              ))}
            </Pie>
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
