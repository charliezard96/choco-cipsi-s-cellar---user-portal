import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSettings } from '../contexts/AppSettingsContext';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const { tastingsEnabled } = useAppSettings();

  const FOOTER_LINKS = [
    { label: 'Archivio', path: '/' },
    { label: 'Produttori', path: '/producers' },
    ...(tastingsEnabled ? [{ label: 'Degustazioni', path: '/tastings' }] : []),
    { label: 'Community', path: '/community' },
  ];

  return (
    <footer className="bg-stone-100 border-t border-stone-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link to="/" className="font-serif text-lg italic text-stone-900">DeCacao Cellar</Link>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-stone-800">
            © {year} DeCacao. Dedicata alla provenienza e alle note di degustazione.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          {FOOTER_LINKS.map(link => (
            <Link key={link.label} to={link.path}
              className="font-sans text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-secondary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};