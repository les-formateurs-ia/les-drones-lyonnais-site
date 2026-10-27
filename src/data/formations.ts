// The drone training offer, from the current /formations-drone-a-lyon/ page: two
// families (technical: BTP and civil engineering, RS6765; artistic: media and
// communication, RS6766), each with a certification for the Open category (BAPD), one for
// the Specific category (CATS), and specialisations.

export type FormationFamily = 'technique' | 'artistique';
export type FormationLevel = 'open' | 'specifique' | 'specialisation';

export interface Formation {
  id: string;
  family: FormationFamily;
  level: FormationLevel;
  title: string;
  /** Sector or scenario, shown under the title. */
  scope: string;
  summary: string;
  duration: string;
  facts: string[];
  /** Photo in src/assets/services, used on the hero cards. */
  image: string;
}

export const LEVEL_LABEL: Record<FormationLevel, string> = {
  open: 'Catégorie Open',
  specifique: 'Catégorie Spécifique',
  specialisation: 'Spécialisation',
};

export const FORMATION_FAMILIES: Record<FormationFamily, { title: string; tagline: string; description: string; certification: string }> = {
  technique: {
    title: 'Formations techniques',
    tagline: 'BTP et génie civil',
    description: 'Piloter un drone professionnel pour l’inspection, la mesure et le suivi d’ouvrages, puis se spécialiser.',
    certification: 'Certification officielle RS6765',
  },
  artistique: {
    title: 'Formations artistiques',
    tagline: 'Média et communication',
    description: 'Piloter un drone pour les métiers de l’image, de la communication et de l’audiovisuel, puis se perfectionner.',
    certification: 'Certification officielle RS6766',
  },
};

export const FORMATIONS: Formation[] = [
  {
    id: 'open-bapd-btp',
    family: 'technique',
    level: 'open',
    title: 'Open BAPD',
    scope: 'BTP et génie civil, scénarios A1, A2 et A3',
    summary: 'La certification de référence pour piloter un drone professionnel en catégorie Open dans le secteur du BTP et du génie civil.',
    duration: '42 heures',
    facts: ['Tous niveaux', 'Certification incluse'],
    image: 'topographie.jpg',
  },
  {
    id: 'cats-btp',
    family: 'technique',
    level: 'specifique',
    title: 'Spécifique CATS',
    scope: 'BTP et génie civil, scénarios STS-01 et STS-02',
    summary: 'La certification de référence pour piloter un drone professionnel en catégorie Spécifique dans le secteur du BTP et du génie civil.',
    duration: '5 jours',
    facts: ['Tous niveaux', 'Certification incluse'],
    image: 'inspection-visuelle.jpg',
  },
  {
    id: 'thermographie',
    family: 'technique',
    level: 'specialisation',
    title: 'Thermographie par drone',
    scope: 'Spécialisation technique',
    summary: 'Maîtrisez l’inspection thermique par drone et l’analyse des données pour détecter les anomalies.',
    duration: '5 jours',
    facts: ['BAPD ou CATS requis'],
    image: 'inspection-thermique.jpg',
  },
  {
    id: 'pulverisation',
    family: 'technique',
    level: 'specialisation',
    title: 'Pulvérisation par drone',
    scope: 'Spécialisation technique',
    summary: 'Apprenez à préparer et réaliser des missions de pulvérisation par drone en toute sécurité.',
    duration: '5 jours',
    facts: ['CATS requis'],
    image: 'demoussage.jpg',
  },
  {
    id: 'photogrammetrie',
    family: 'technique',
    level: 'specialisation',
    title: 'Photogrammétrie et modélisation 3D',
    scope: 'Spécialisation technique',
    summary: 'Maîtrisez l’acquisition et le traitement des données pour créer des modèles 3D précis au centimètre près.',
    duration: '5 jours',
    facts: ['BAPD ou CATS requis'],
    image: 'modelisation-3d.jpg',
  },
  {
    id: 'open-bapd-media',
    family: 'artistique',
    level: 'open',
    title: 'Open BAPD',
    scope: 'Média et communication, scénarios A1, A2 et A3',
    summary: 'Certification drone dédiée aux métiers de l’image, de la communication et de l’audiovisuel, en catégorie Open.',
    duration: '42 heures',
    facts: ['En présentiel', 'Certification incluse'],
    image: 'cinema.jpg',
  },
  {
    id: 'cats-media',
    family: 'artistique',
    level: 'specifique',
    title: 'Spécifique CATS',
    scope: 'Image et son, scénarios STS-01 et STS-02',
    summary: 'Maîtrisez la prise de vue aérienne professionnelle pour opérer en catégorie Spécifique.',
    duration: '5 jours',
    facts: ['En présentiel', 'Certification incluse'],
    image: 'live.jpg',
  },
  {
    id: 'specialisation-audiovisuelle',
    family: 'artistique',
    level: 'specialisation',
    title: 'Spécialisation audiovisuelle',
    scope: 'Cadrage, trajectoires, créativité',
    summary: 'Perfectionnez votre cadrage, vos trajectoires et votre créativité pour produire des images à forte valeur ajoutée.',
    duration: '5 jours',
    facts: ['Expérience requise'],
    image: 'fpv.jpg',
  },
  {
    id: 'production-audiovisuelle',
    family: 'artistique',
    level: 'specialisation',
    title: 'Production audiovisuelle',
    scope: 'Tournage, montage, diffusion',
    summary: 'Une formation complète aux métiers de la production : tournage, drone, montage vidéo et diffusion.',
    duration: '10 jours',
    facts: ['Certification DGAC'],
    image: 'post-production.jpg',
  },
];

export const formationsOf = (family: FormationFamily) => FORMATIONS.filter((f) => f.family === family);

/** The three promises of the current page. */
export const FORMATION_PROMISES = [
  { title: 'Formateurs du terrain', text: 'Des télépilotes qui volent chaque semaine.' },
  { title: 'Certifiantes', text: 'RS6765 et RS6766, reconnues par l’État.' },
  { title: 'Finançables', text: 'Éligibles au CPF.' },
];

/** How a training goes, a real sequence. */
export const FORMATION_STEPS = [
  { title: 'Échange', text: 'Nous faisons le point sur votre projet, votre niveau et le financement possible.' },
  { title: 'Théorie', text: 'Réglementation, météo, sécurité et préparation de mission, en salle à Lyon.' },
  { title: 'Pratique', text: 'Vols encadrés sur terrain, avec le matériel professionnel de l’équipe.' },
  { title: 'Certification', text: 'Évaluation et délivrance de la certification correspondant à votre parcours.' },
];
