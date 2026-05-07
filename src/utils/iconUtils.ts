import * as Icons from 'lucide-react';

export const getIconHelper = (slug: string | null, group?: string) => {
  if (!slug && !group) return Icons.Search;
  
  const formattedName = slug ? slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') : '';
  
  // 1. Try Direct PascalCase
  if (formattedName && (Icons as any)[formattedName]) return (Icons as any)[formattedName];
  
  // 2. Try common category fallbacks based on group/slug keywords
  const lowerSlug = slug?.toLowerCase() || '';
  const lowerGroup = group?.toLowerCase() || '';
  
  if (lowerGroup.includes('frutt') || lowerSlug.includes('berry') || lowerSlug.includes('fruit')) return Icons.Apple;
  if (lowerGroup.includes('flor') || lowerSlug.includes('flower') || lowerSlug.includes('rose')) return Icons.Flower2;
  if (lowerGroup.includes(' tost') || lowerGroup.includes('spec') || lowerSlug.includes('spice')) return Icons.Flame;
  if (lowerGroup.includes('latt') || lowerSlug.includes('milk') || lowerSlug.includes('crem')) return Icons.Milk;
  if (lowerGroup.includes('erba') || lowerSlug.includes('grass') || lowerSlug.includes('leaf')) return Icons.Leaf;
  if (lowerGroup.includes('tost') || lowerSlug.includes('nut') || lowerSlug.includes('mandorl')) return Icons.Nut;
  if (lowerGroup.includes('dolc') || lowerSlug.includes('sugar') || lowerSlug.includes('honey')) return Icons.Candy;
  if (lowerGroup.includes('bosc') || lowerGroup.includes('wood') || lowerSlug.includes('pin') || lowerSlug.includes('oak')) return Icons.Trees;
  
  return Icons.Search;
};
