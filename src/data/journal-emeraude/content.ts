export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'cinema' | 'marques' | 'chroniques' | 'diplomatie';
  categoryLabel: string;
  year: string;
  clientOrDirector: string;
  role: string;
  heroImage: string;
  videoPreview?: string;
  metrics: {
    views?: string;
    engagement?: string;
    impact?: string;
  };
  synopsis: string;
  fullStory: string;
  gallery: string[];
  tags: string[];
  featured?: boolean;
}

export interface Endorsement {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  badge: string;
  avatar?: string;
}

export interface ScreenFormat {
  id: string;
  title: string;
  tagline: string;
  description: string;
  metrics: {
    highlight: string;
    caption: string;
  };
  pills: string[];
  image: string;
}

export interface AgencyService {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  icon: string;
}

export interface MetricCard {
  value: string;
  label: string;
  detail: string;
  trend?: string;
}

export const MANIFESTO_DATA = {
  name: "Martine Myphe Lomba",
  pseudonym: "Émeraude",
  origin: "Koulamoutou, Gabon",
  tagline: "Plus qu'une voix, une onde culturelle.",
  subtagline: "Actrice • Chroniqueuse d'Opinion • Fondatrice d'Agence de Communication",
  portraitImage: "/images/emeraude/martine-myphe-lomba.jpg",
  quote: "Raconter nos vérités avec panache, faire rire sans abaisser, inspirer sans tricher.",
  bioParagraphs: [
    "Née en 1993 à Koulamoutou dans la province de l'Ogooué-Lolo, Martine Myphe Lomba a su transcender l'humour satirique pour s'imposer comme l'une des personnalités culturelles les plus influentes du Gabon et d'Afrique centrale. Derrière son pseudonyme devenu emblème — Émeraude —, réside une artiste et entrepreneuse visionnaire façonnée par l'art oratoire, la justesse d'observation et une audace sans compromis.",
    "Révélée par ses chroniques virales cumulant plus de 12 millions de vues, elle a brillamment élargi son champ artistique au cinéma et à la fiction télévisée de premier plan (séries 'Eki' sur Canal+, 'EWUSU', 'Koto et Kengué'). Son court-métrage dramatique 'Stérile' a d'ailleurs été consacré par le Premier Prix au Festival International du Court-Métrage d'Afrique Centrale (Festiciné).",
    "En avril 2025, elle franchit un cap entrepreneurial majeur en inaugurant le siège officiel de son entreprise de communication et studio de production à Libreville : Le Journal d'Émeraude. Nommée Ambassadrice de la Caravane Touristique du Gabon et associée aux préparatifs de l'Exposition Universelle Osaka 2025, elle incarne aujourd'hui la synthèse idéale entre rayonnement artistique et impact de marque."
  ]
};

export const PROJECTS_DATA: Project[] = [
  {
    id: "sterile-festicine",
    title: "Stérile",
    subtitle: "Court-Métrage Dramatique & Premier Prix Festiciné",
    category: "cinema",
    categoryLabel: "Cinéma & Fictions",
    year: "2023 - 2024",
    clientOrDirector: "Production & Interprétation : Martine Myphe Lomba",
    role: "Autrice & Rôle Titre Principal",
    heroImage: "/images/emeraude/project-sterile.jpg",
    metrics: {
      views: "1er Prix",
      engagement: "Festiciné Afrique Centrale",
      impact: "Reconnaissance Critique"
    },
    synopsis: "Un drame intime et poignant explorant la pression sociale, conjugale et familiale qui pèse sur les femmes confrontées à l'infertilité en Afrique.",
    fullStory: "Couronné par le Premier Prix au Festival International du Court-Métrage d'Afrique Centrale (Festiciné), ce film a révélé toute la profondeur dramatique d'Émeraude. Loin du registre de la satire, Martine y délivre une performance bouleversante saluée par l'ensemble de la critique cinématographique panafricaine.",
    gallery: [
      "/images/emeraude/martine-myphe-lomba.jpg",
      "/images/emeraude/project-sterile.jpg"
    ],
    tags: ["Court-Métrage", "Drame", "1er Prix Festiciné", "Cinéma Engagé"],
    featured: true
  },
  {
    id: "eki-canal-plus",
    title: "Eki",
    subtitle: "Série Événement Canal+ Original (Tournage Libreville)",
    category: "cinema",
    categoryLabel: "Cinéma & Fictions",
    year: "2023 - 2024",
    clientOrDirector: "Diffusion : Canal+ Première / Canal+ Afrique",
    role: "Comédienne & Personnage Récurrent",
    heroImage: "/images/emeraude/project-eki.jpg",
    metrics: {
      views: "Prime Time",
      engagement: "Diffusion 25+ Pays",
      impact: "Succès Pan-Africain"
    },
    synopsis: "Thriller juridique et traditionnel au cœur de Libreville, mêlant enquêtes judiciaires et croyances ancestrales gabonaises.",
    fullStory: "En intégrant le casting de prestige de cette grande coproduction internationale Canal+, Émeraude a prouvé son envergure d'actrice de télévision de premier plan. Sa présence a contribué à l'attachement massif du public gabonais et international à la série.",
    gallery: [
      "/images/emeraude/martine-myphe-lomba.jpg"
    ],
    tags: ["Canal+ Original", "Série Télévisée", "Thriller", "Tournage Libreville"],
    featured: true
  },
  {
    id: "ewusu-serie",
    title: "EWUSU",
    subtitle: "Série Policière & Phénomène Audiovisuel Gabonais",
    category: "cinema",
    categoryLabel: "Cinéma & Fictions",
    year: "2023",
    clientOrDirector: "Production Audiovisuelle Gabonaise",
    role: "Comédienne Principale",
    heroImage: "/images/emeraude/project-ewusu.jpg",
    metrics: {
      views: "Millions de Vues",
      engagement: "Top Tendance Gabon",
      impact: "Culte Populaire"
    },
    synopsis: "Une plongée haletante dans les mystères et les intrigues de la société gabonaise contemporaine.",
    fullStory: "Véritable phénomène télévisuel, EWUSU a mobilisé les spectateurs à travers tout le Gabon. La performance de Martine Myphe Lomba y a apporté une intensité dramatique et un charisme remarqués, confirmant son statut d'actrice incontournable.",
    gallery: [
      "/images/emeraude/martine-myphe-lomba.jpg"
    ],
    tags: ["Série Culte", "Fiction Gabonaise", "Drame Policier"],
    featured: true
  },
  {
    id: "le-journal-demeraude-satire",
    title: "Le Journal d'Émeraude",
    subtitle: "La Chronique Satirique Phare & Phénomène de Société",
    category: "chroniques",
    categoryLabel: "Chroniques & Formats Originaux",
    year: "2018 - 2025",
    clientOrDirector: "Création Originale : Émeraude",
    role: "Autrice, Interprète & Réalisatrice",
    heroImage: "/images/emeraude/project-journal-satire.jpg",
    metrics: {
      views: "12M+ Vues",
      engagement: "380K Partages",
      impact: "Débat National"
    },
    synopsis: "Chaque épisode décortique avec une ironie mordante, un sens aigu de la répartie et une bienveillance contagieuse les réalités du quotidien africain.",
    fullStory: "C'est ce format culte qui a créé l'onde culturelle Émeraude. Des cours de récréation aux cabinets ministériels, ses punchlines et ses personnages sont entrés dans le langage courant au Gabon et dans la diaspora.",
    gallery: [
      "/images/emeraude/martine-myphe-lomba.jpg"
    ],
    tags: ["Chronique Numérique", "Humour Satirique", "Société", "Virale"],
    featured: true
  },
  {
    id: "caravane-touristique-osaka2025",
    title: "Ambassadrice Caravane Touristique & Osaka 2025",
    subtitle: "Représentation Officielle & Diplomatie Culturelle",
    category: "diplomatie",
    categoryLabel: "Diplomatie & Osaka 2025",
    year: "2024 - 2025",
    clientOrDirector: "Ministère du Tourisme & Institutions Publiques",
    role: "Ambassadrice Culturelle & Voix Nationale",
    heroImage: "/images/emeraude/project-osaka2025.jpg",
    metrics: {
      views: "Portée Mondiale",
      engagement: "9 Provinces du Gabon",
      impact: "Pavillon Gabon Osaka"
    },
    synopsis: "Mise en valeur du patrimoine naturel, écologique et des trésors des 9 provinces du Gabon en vue de l'Exposition Universelle Osaka 2025.",
    fullStory: "Choisie par les autorités pour son magnétisme et sa proximité indéfectible avec les Gabonais, Martine porte la voix des parcs nationaux, de la biodiversité et de l'hospitalité gabonaise auprès du public national et des délégations internationales.",
    gallery: [
      "/images/emeraude/martine-myphe-lomba.jpg"
    ],
    tags: ["Ambassadrice", "Osaka 2025", "Caravane Touristique", "Gabon"],
    featured: false
  },
  {
    id: "inauguration-siege-agence-2025",
    title: "Inauguration du Siège Le Journal d'Émeraude",
    subtitle: "Ouverture Officielle de l'Entreprise de Communication & Studio",
    category: "marques",
    categoryLabel: "Studio & Partenariats",
    year: "Avril 2025",
    clientOrDirector: "Entreprise Le Journal d'Émeraude (Libreville)",
    role: "Fondatrice & Directrice Générale",
    heroImage: "/images/emeraude/project-agence-studio.jpg",
    metrics: {
      views: "Studio 4K Libreville",
      engagement: "Production Indépendante",
      impact: "Entrepreneuriat Féminin"
    },
    synopsis: "Inauguration solennelle du siège de son agence de communication et studio audiovisuel pour professionnaliser le brand content en Afrique centrale.",
    fullStory: "En avril 2025, Martine Myphe Lomba a concrétisé sa vision entrepreneuriale en ouvrant un siège moderne dédié à la production 4K, à la scénarisation et au conseil en stratégie de contenu pour les plus grands annonceurs du Gabon et de la région.",
    gallery: [
      "/images/emeraude/martine-myphe-lomba.jpg"
    ],
    tags: ["Inauguration 2025", "Agence Médias", "Studio 4K", "Libreville"],
    featured: false
  }
];

export const AGENCY_SERVICES: AgencyService[] = [
  {
    id: "brand-content",
    number: "01",
    title: "Brand Content & Récits de Marques",
    subtitle: "Scénarisation, Direction Artistique & Viralisme Haut de Gamme",
    description: "Nous concevons des campagnes publicitaires sous forme de sagas narratives percutantes. L'humour, l'émotion et l'authenticité culturelle sont mis au service direct de votre notoriété et de vos conversions.",
    deliverables: [
      "Écriture de scripts sur-mesure & storyboarding",
      "Tournage en régie cinéma 4K à Libreville ou en région",
      "Post-production, étalonnage couleur luxe & sound design",
      "Plan de diffusion multi-plateformes calibré pour maximiser le reach"
    ],
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
  },
  {
    id: "egerie-partenariat",
    number: "02",
    title: "Égérie de Marque & Ambassadrice",
    subtitle: "Partenariats Stratégiques & Accords d'Exclusivité Annuels",
    description: "Associez votre marque au visage de la crédibilité, de l'élégance et de la sympathie populaire au Gabon et en Afrique centrale. Une présence cohérente sur vos affichages, spots TV et activations de terrain.",
    deliverables: [
      "Contrat d'image annuel avec clauses d'exclusivité sectorielle",
      "Shooting photo haute définition pour print & billboards nationaux",
      "Interventions officielles lors de vos lancements et conventions",
      "Relais stratégique certifié sur les canaux d'Émeraude (>2.5M)"
    ],
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
  },
  {
    id: "studio-production",
    number: "03",
    title: "Studio Audiovisuel & Production Déléguée",
    subtitle: "Infrastructures Techniques, Régie 4K & Équipe Dédiée",
    description: "Inauguré en 2025, notre studio basé à Libreville met à disposition des annonceurs et producteurs une chaîne de fabrication audiovisuelle complète, répondant aux standards broadcast internationaux.",
    deliverables: [
      "Plateau de tournage insonorisé avec cyclo & décors modulables",
      "Caméras Sony FX6 / Blackmagic 6K, éclairages Aputure & optiques cinéma",
      "Ingénierie sonore : prises de son sans fil professionnelles & studio voix off",
      "Équipe technique gabonaise chevronnée (cadreurs, monteurs, stylistes)"
    ],
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
  },
  {
    id: "conferences-eloquence",
    number: "04",
    title: "Masterclasses, Modération & Événements VIP",
    subtitle: "Art Oratoire, Leadership Féminin & Maîtrise de Cérémonie",
    description: "Donnez un éclat mémorable à vos sommets économiques, galas caritatifs et programmes de mentorat. Une présence scénique magnétique qui captive les assemblées les plus exigeantes.",
    deliverables: [
      "Animation bilingue ou francophone de conventions & galas",
      "Keynote d'inspiration : parcours de résilience & entrepreneuriat",
      "Ateliers de prise de parole en public pour dirigeantes & cadres",
      "Animation de panels institutionnels de haut niveau"
    ],
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
  }
];

export const METRICS_DATA: MetricCard[] = [
  {
    value: "2.5M+",
    label: "Communauté Consolidée",
    detail: "TikTok (1.2M), Facebook (850K), Instagram (450K), YouTube",
    trend: "+35% en 2024"
  },
  {
    value: "84%",
    label: "Audience & Affinité Féminine",
    detail: "Cœur de cible active 18–35 ans & mères de famille",
    trend: "Indice d'attachement record"
  },
  {
    value: "15+",
    label: "Grandes Marques & Institutions",
    detail: "Télécoms, Banques, Ministères, Tourisme & FMCG",
    trend: "100% Fidélisation client"
  },
  {
    value: "Top 1%",
    label: "Notoriété Culturelle au Gabon",
    detail: "Présente dans les 9 provinces et la diaspora",
    trend: "Leader d'opinion certifiée"
  }
];

export const DEMOGRAPHICS = [
  { territory: "Gabon (Libreville, Port-Gentil, 9 Provinces)", percent: "52%" },
  { territory: "Afrique Centrale & Ouest (Cameroun, Côte d'Ivoire, Congo)", percent: "31%" },
  { territory: "Diaspora Internationale (France, Canada, Belgique, USA)", percent: "17%" }
];

export const FORMATS_DATA = {
  mobileReels: {
    deviceLabel: "Format Mobile 9:16",
    title: "Les Chroniques Satiriques",
    showName: "Le Journal d'Émeraude",
    reach: ">12M Vues Consolidées",
    shares: "380K+ Partages",
    description: "Des capsules percutantes tournées en vertical, fusionnant humour acerbe, dérision et analyse sans filtre des mœurs sociétales. L'outil d'impact viral n°1 pour les marques désireuses d'intégrer le quotidien des Gabonais.",
    tags: ["TikTok (1.2M)", "Facebook Reels", "Instagram", "Format 9:16"],
    image: "/images/emeraude/project-journal-satire.jpg"
  },
  cinemaScreen: {
    deviceLabel: "Format Cinéma 16:9 4K",
    title: "Le Grand Écran & Les Fictions",
    activeFilm: "Stérile • Eki • EWUSU",
    award: "1er Prix Festiciné • Prime Time Canal+",
    resolution: "Broadcast 4K DCI & Séries",
    description: "Une maturité dramatique confirmée sur les plateaux de tournage internationaux. Du thriller juridique à la tragédie intime, Martine insuffle une vérité brute saluée par les plus grands festivals et diffuseurs du continent.",
    tags: ["Canal+ Original", "1er Prix Festiciné", "Série Culte EWUSU", "Cadence 24fps"],
    image: "/images/emeraude/project-sterile.jpg"
  }
};

export const ENDORSEMENTS_DATA: Endorsement[] = [
  {
    id: "canal-plus",
    quote: "Martine apporte à la série Eki une présence magnétique et une justesse populaire immédiate. Elle sait incarner la complexité des récits africains contemporains avec une rigueur d'interprétation qui touche un public panafricain dans plus de 25 pays.",
    author: "Direction des Fictions Originales",
    role: "Pôle Fictions & Coproductions Panafricaines",
    organization: "Canal+ International / Canal+ Afrique",
    badge: "DIFFUSEUR INTERNATIONAL"
  },
  {
    id: "festicine",
    quote: "Le Premier Prix décerné à 'Stérile' n'a laissé aucune hésitation aux jurés. Loin de son registre satirique, Émeraude s'est révélée une actrice dramatique d'une intensité bouleversante, portant le sujet tabou de l'infertilité féminine avec une dignité remarquable.",
    author: "Comité de Sélection & Jury Officiel",
    role: "Festival International du Court-Métrage",
    organization: "Festiciné Afrique Centrale",
    badge: "RECONNAISSANCE CRITIQUE"
  },
  {
    id: "telecom-partner",
    quote: "Collaborer avec Martine Myphe Lomba a transformé notre approche du brand content. Nos messages de campagne ont atteint un taux d'attention et de conversion record grâce à sa crédibilité et à l'attachement viscéral de son audience de plus de 2,5 millions de personnes.",
    author: "Directrice Marque, Médias & Expérience Client",
    role: "Direction Marketing & Communication",
    organization: "Groupe Télécoms & Services Financiers Mobiles",
    badge: "PARTENAIRE ANNONCEUR"
  },
  {
    id: "osaka-tourism",
    quote: "Nommée Ambassadrice de la Caravane Touristique, Émeraude a su sublimer l'identité des 9 provinces du Gabon. Son rayonnement et son éloquence font d'elle la voix idéale pour valoriser notre biodiversité et nos richesses culturelles à l'Exposition Universelle Osaka 2025.",
    author: "Commissariat Général aux Célébrations Culturelles",
    role: "Direction de la Promotion et du Rayonnement",
    organization: "Ministère du Tourisme / Pavillon Gabon Osaka 2025",
    badge: "DIPLOMATIE CULTURELLE"
  }
];

