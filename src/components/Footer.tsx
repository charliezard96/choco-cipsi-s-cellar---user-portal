import React from 'react';

interface FooterProps {
  onNavigate: (view: any) => void;
}

const FOOTER_LINKS = [
  { label: 'Archivio', view: 'encyclopedia' },
  { label: 'Produttori', view: 'producers' },
  { label: 'Metodologia', view: 'tastings' },
  { label: 'Community', view: 'community' },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-100 border-t border-stone-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="font-serif text-lg italic text-stone-900">The Choco Cipsi's Cellar</span>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-stone-800">
            © {year} The Choco Cipsi's Cellar. Dedicata alla provenienza e alle note di degustazione.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          {FOOTER_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => onNavigate(link.view)}
              className="font-sans text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-secondary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
};  