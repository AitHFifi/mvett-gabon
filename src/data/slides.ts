export interface SlideItem {
  id: string;
  title: string;
  category: string;
  client?: string;
  image: string;
  backgroundColor: string;
  displayMode?: 'contain' | 'cover';
}

export const slides: SlideItem[] = [
  {
    id: 'ajax-rebrand',
    title: 'AFC Ajax — Brand Architecture & Identity',
    category: 'Brand Identity / Sports',
    client: 'AFC Ajax Amsterdam',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=85&w=2400&auto=format&fit=crop',
    backgroundColor: '#871a22',
    displayMode: 'contain'
  },
  {
    id: 'cymru-wales',
    title: 'Cymru — The National Brand for Wales',
    category: 'Nation Branding / Strategy',
    client: 'Welsh Government',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=85&w=2400&auto=format&fit=crop',
    backgroundColor: '#161819',
    displayMode: 'contain'
  },
  {
    id: 'form-volume',
    title: 'Form & Volume — Spatial Exhibition Design',
    category: 'Spatial Design / Interiors',
    client: 'Stedelijk Museum',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=85&w=2400&auto=format&fit=crop',
    backgroundColor: '#2e332e',
    displayMode: 'contain'
  },
  {
    id: 'kinetic-type',
    title: 'Kinetic Identity & Modular Typeface',
    category: 'Type Design / Motion',
    client: 'Smörgåsbord Foundry',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=85&w=2400&auto=format&fit=crop',
    backgroundColor: '#0c28d4',
    displayMode: 'contain'
  },
  {
    id: 'heritage-editorial',
    title: 'Heritage Monograph & Fine Publishing',
    category: 'Editorial / Print',
    client: 'Phaidon Press',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=85&w=2400&auto=format&fit=crop',
    backgroundColor: '#6c432d',
    displayMode: 'contain'
  },
  {
    id: 'sound-vision',
    title: 'Sound & Vision — Broadcast Art Direction',
    category: 'Broadcast / Art Direction',
    client: 'BBC Culture',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=85&w=2400&auto=format&fit=crop',
    backgroundColor: '#0a0a0a',
    displayMode: 'contain'
  }
];
