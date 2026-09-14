export interface ProvincePhoto {
  id: string;
  title: string;
  location: string;
  image: string;
  caption?: string;
  backgroundColor: string;
}

export interface Province {
  id: string;
  code: string;
  name: string;
  capital: string;
  description: string;
  photos: ProvincePhoto[];
}

export const provinces: Province[] = [
  {
    id: 'estuaire',
    code: 'G1',
    name: 'Estuaire',
    capital: 'Libreville',
    description: 'Bordée par l’Océan Atlantique et l’estuaire du Komo, terre d’accueil et capitale vibrante du Gabon, entre plages dorées de la Pointe-Denis et la forêt vierge des Monts de Cristal.',
    photos: [
      {
        id: 'estuaire-libreville-coast',
        title: 'Estuaire du Komo & Front de Mer',
        location: 'Libreville · Estuaire',
        caption: 'La rencontre des mangroves séculaires et de l’Océan Atlantique au crépuscule.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#1b2c34'
      },
      {
        id: 'estuaire-cristal',
        title: 'Forêt Sacrée des Monts de Cristal',
        location: 'Parc National des Monts de Cristal · Estuaire',
        caption: 'Canopée brumeuse et sanctuaire végétal le plus riche en biodiversité d’Afrique centrale.',
        image: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#13241b'
      },
      {
        id: 'estuaire-pointe-denis',
        title: 'Plage Sauvage de la Pointe-Denis',
        location: 'Presqu’île de la Pointe-Denis',
        caption: 'Sable blanc immaculé où les tortues viennent nicher à la lueur de la lune.',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#27383a'
      }
    ]
  },
  {
    id: 'haut-ogooue',
    code: 'G2',
    name: 'Haut-Ogooué',
    capital: 'Franceville',
    description: 'Les hauts plateaux Batéké, les canyons vertigineux de grès rouge de Léconi et le pont de lianes historique de Poubara sur l’Ogooué tumultueux.',
    photos: [
      {
        id: 'haut-ogooue-leconi',
        title: 'Canyons Pourpres de Léconi',
        location: 'Plateaux Batéké · Haut-Ogooué',
        caption: 'Cirques de sable ocre et savanes ouvertes façonnées par des millénaires d’érosion.',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#522b1c'
      },
      {
        id: 'haut-ogooue-poubara',
        title: 'Pont de Lianes de Poubara',
        location: 'Fleuve Ogooué · Franceville',
        caption: 'Génie d’ingénierie végétale tissé à la main au-dessus des chutes rugissantes de Poubara.',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#213326'
      }
    ]
  },
  {
    id: 'moyen-ogooue',
    code: 'G3',
    name: 'Moyen-Ogooué',
    capital: 'Lambaréné',
    description: 'Le cœur lacustre et fluvial du Gabon, célèbre pour l’île fluviale de Lambaréné, ses lacs paisibles (Zilé, Onangué) et le chant des pirogues sur l’eau miroitante.',
    photos: [
      {
        id: 'moyen-ogooue-lambarene',
        title: 'Méandres Fluviaux & Pirogues de l’Ogooué',
        location: 'Lambaréné · Moyen-Ogooué',
        caption: 'L’art de la navigation fluviale au pays des lacs intérieurs et des nénuphars géants.',
        image: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#1f2e38'
      },
      {
        id: 'moyen-ogooue-lake',
        title: 'Reflets Crépusculaires sur le Lac Onangué',
        location: 'Lacs du Moyen-Ogooué',
        caption: 'Silence mystique interrompu seulement par le vol des martins-pêcheurs et des hérons.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#352922'
      }
    ]
  },
  {
    id: 'ngounie',
    code: 'G4',
    name: 'Ngounié',
    capital: 'Mouila',
    description: 'Région aux mille mystères abritant le légendaire Lac Bleu de Mouila aux eaux cristallines et les chutes vrombissantes de l’Impératrice Eugénie.',
    photos: [
      {
        id: 'ngounie-lac-bleu',
        title: 'Les Profondeurs Sacrées du Lac Bleu',
        location: 'Mouila · Ngounié',
        caption: 'Un miroir d’azur limpide gardé par les esprits ancestraux de la forêt gabonaise.',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#183138'
      },
      {
        id: 'ngounie-chutes',
        title: 'Chutes Vrombissantes de la Ngounié',
        location: 'Chutes de Samba / Impératrice',
        caption: 'L’énergie pure et indomptée des cascades déchirant la roche basaltique équatoriale.',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#192621'
      }
    ]
  },
  {
    id: 'nyanga',
    code: 'G5',
    name: 'Nyanga',
    capital: 'Tchibanga',
    description: 'Le sanctuaire marin de Mayumba, où les tortues luth géantes viennent pondre sur des plages vierges infinies, adossées aux monts Doudou.',
    photos: [
      {
        id: 'nyanga-mayumba',
        title: 'Plage Sauvage du Parc National de Mayumba',
        location: 'Mayumba · Nyanga',
        caption: 'Le royaume des tortues luth marines et le souffle de l’Atlantique Sud.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#202a33'
      },
      {
        id: 'nyanga-savane',
        title: 'Savanes Côtières & Monts Doudou',
        location: 'Bassin de la Nyanga',
        caption: 'Entre steppe herbeuse dorée et contreforts forestiers peuplés d’éléphants de forêt.',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#38321e'
      }
    ]
  },
  {
    id: 'ogooue-ivindo',
    code: 'G6',
    name: 'Ogooué-Ivindo',
    capital: 'Makokou',
    description: 'La plus vaste province forestière du Gabon, écrin du Parc National d’Ivindo (classé UNESCO) avec les spectaculaires Chutes de Kongou et Mingouli.',
    photos: [
      {
        id: 'ivindo-kongou',
        title: 'Chutes de Kongou — Trésor Mondial UNESCO',
        location: 'Parc National d’Ivindo · Makokou',
        caption: 'Une cataracte titanesque s’étendant sur plus de 3 kilomètres au milieu de la jungle primaire.',
        image: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#1c2e26'
      },
      {
        id: 'ivindo-canopy',
        title: 'La Grande Forêt Primaire Équatoriale',
        location: 'Bassin de l’Ivindo',
        caption: 'L’un des derniers poumons intacts de la planète, refuge des gorilles des plaines et des grands calaos.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#17271e'
      }
    ]
  },
  {
    id: 'ogooue-lolo',
    code: 'G7',
    name: 'Ogooué-Lolo',
    capital: 'Koulamoutou',
    description: 'Le massif du Chaillu, dominé par le Mont Iboundji, et les mystérieuses grottes archéologiques millénaires de Lastoursville.',
    photos: [
      {
        id: 'lolo-chaillu',
        title: 'Brumes sur le Massif du Chaillu',
        location: 'Mont Iboundji · Koulamoutou',
        caption: 'Les crêtes escarpées émergeant au-dessus d’une mer de nuages matinaux.',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#28313a'
      },
      {
        id: 'lolo-grottes',
        title: 'Grottes Historiques de Lastoursville',
        location: 'Lastoursville · Ogooué-Lolo',
        caption: 'Dédale souterrain calcaire portant les traces rupestres des premières populations préhistoriques.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#33231b'
      }
    ]
  },
  {
    id: 'ogooue-maritime',
    code: 'G8',
    name: 'Ogooué-Maritime',
    capital: 'Port-Gentil',
    description: 'La capitale économique pétrolière et maritime et le mythique Parc National de Loango — surnommé "Le Dernier Éden d’Afrique" où les éléphants et buffles se promènent sur la plage.',
    photos: [
      {
        id: 'maritime-loango-beach',
        title: 'Loango — Le Dernier Éden d’Afrique',
        location: 'Parc National de Loango · Ogooué-Maritime',
        caption: 'Le seul endroit au monde où les éléphants de forêt et les gorilles marchent sur le ressac de l’Atlantique.',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#1f2e3d'
      },
      {
        id: 'maritime-lagoon',
        title: 'Lagune d’Iguela & Baleines à Bosse',
        location: 'Côte Sauvage · Ogooué-Maritime',
        caption: 'Miroir d’eau saumâtre et halte migratoire des cétacés dans le golfe de Guinée.',
        image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#162838'
      }
    ]
  },
  {
    id: 'woleu-ntem',
    code: 'G9',
    name: 'Woleu-Ntem',
    capital: 'Oyem',
    description: 'Le septentrion gabonais au climat doux, berceau des récits épiques du Mvett, de la sculpture sur bois sacrée et de la culture ancestrale du peuple Fang.',
    photos: [
      {
        id: 'woleu-ntem-mvett',
        title: 'Terre Sacrée de l’Épopée du Mvett',
        location: 'Oyem · Woleu-Ntem',
        caption: 'Là où la harpe-cithare du Mvett résonne dans la nuit pour conter l’épopée des immortels d’Engong.',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#52191c'
      },
      {
        id: 'woleu-ntem-hills',
        title: 'Collines Ondoyantes du Grand Nord',
        location: 'Bitam & Hauts Plateaux · Woleu-Ntem',
        caption: 'Plantations de cacao, clairières et brumes douces du plateau septentrional.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=85&w=2400&auto=format&fit=crop',
        backgroundColor: '#1f3323'
      }
    ]
  }
];

// Helper to get flattened slide array for continuous browsing
export interface FlatSlide extends ProvincePhoto {
  provinceId: string;
  provinceIndex: number;
  provinceCode: string;
  provinceName: string;
  provinceCapital: string;
  photoIndexInProvince: number;
  totalPhotosInProvince: number;
  isCommunity?: boolean;
}

export function getFlattenedSlides(): FlatSlide[] {
  const flattened: FlatSlide[] = [];
  provinces.forEach((prov, pIdx) => {
    prov.photos.forEach((photo, phIdx) => {
      flattened.push({
        ...photo,
        provinceId: prov.id,
        provinceIndex: pIdx,
        provinceCode: prov.code,
        provinceName: prov.name,
        provinceCapital: prov.capital,
        photoIndexInProvince: phIdx,
        totalPhotosInProvince: prov.photos.length
      });
    });
  });
  return flattened;
}
