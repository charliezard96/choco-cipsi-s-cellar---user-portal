import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GEO_URL = 'https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson';
const W = 600;
const H = 300;

/* Module-level cache — fetched once per session */
let geoCache: any = null;
let geoPromise: Promise<any> | null = null;

function fetchGeo(): Promise<any> {
  if (geoCache) return Promise.resolve(geoCache);
  if (!geoPromise) geoPromise = d3.json(GEO_URL).then(d => { geoCache = d; return d; });
  return geoPromise;
}

/* Robust origin→country matching, handles "Chuao, Venezuela", "Dominican Republic", etc. */
function matchesOrigin(geoName: string, origin: string): boolean {
  const geo = geoName.toLowerCase().trim();
  const ori = origin.toLowerCase().trim();
  if (!geo || !ori) return false;
  if (geo === ori) return true;
  if (ori.includes(geo) && geo.length >= 4) return true;
  const firstPart = ori.split(',')[0].trim();
  if (geo.includes(firstPart) && firstPart.length >= 4) return true;
  const ALIASES: [string, string[]][] = [
    ['ivory coast', ["côte d'ivoire", 'cote d ivoire']],
    ['sao tome', ['são tomé', 'sao tome']],
    ['dominican', ['dominican rep']],
    ['trinidad', ['trinidad and tobago']],
    ['congo', ['democratic republic of the congo', 'republic of the congo', 'congo, dem. rep.', 'congo, rep.']],
  ];
  for (const [key, variants] of ALIASES) {
    if (ori.includes(key) && variants.some(v => geo.includes(v) || v.includes(geo))) return true;
  }
  return false;
}

interface Props {
  origin: string;
  className?: string;
}

export const OriginMap: React.FC<Props> = ({ origin, className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchGeo().then(geo => {
      if (cancelled || !svgRef.current) return;
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const projection = d3.geoNaturalEarth1().fitSize([W, H], geo);
      const path = d3.geoPath().projection(projection);

      let found = false;
      svg.selectAll('path')
        .data(geo.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', (d: any) => {
          const match = matchesOrigin(d.properties?.name || '', origin);
          if (match) found = true;
          return match ? 'var(--color-secondary, #D4AF37)' : '#e7e5e4';
        })
        .attr('stroke', '#fafaf9')
        .attr('stroke-width', 0.4);

      if (!found) setNotFound(true);
      setLoaded(true);
    }).catch(() => setLoaded(true));

    return () => { cancelled = true; };
  }, [origin]);

  if (notFound) return null;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-stone-50 ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-stone-100 rounded-2xl" />}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className={`w-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute bottom-2 right-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-stone-300">{origin}</span>
      </div>
    </div>
  );
};
