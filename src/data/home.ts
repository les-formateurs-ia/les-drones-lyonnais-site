// Homepage content. Copy taken from the current homepage and service pages,
// reorganised; links point to the URLs already indexed on the WordPress site.
import type { AvatarId } from '../components/ui/Avatar.astro';

export const HERO = {
  title: 'Pilotes de drone à\u00a0Lyon, en mission partout en France',
  intro:
    'Prises de vues aériennes, inspections techniques et formations de pilotes. Nous vendons et louons aussi le matériel que nous utilisons chaque jour.',
};

// Read as one sentence that lights up word by word on scroll.
export const MANIFESTO =
  'Depuis six ans, nous filmons, inspectons, formons et équipons. Plus de mille missions, de Lyon à toute la France, pour des industriels, des chaînes de télévision et des marques.';

export const FACTS = [
  { value: '6 ans', label: 'd’expérience' },
  { value: '1\u00a0000+', label: 'missions réalisées' },
];

/**
 * How the drone camera shows a service on the homepage viewer:
 * thermal (heat map), survey (line drawing of the terrain), mesh (3D model wireframe),
 * detect (inspection boxes), lowlight (confined spaces), timelapse, cine (letterbox),
 * live (broadcast), grade (colour grading split).
 */
export type Sensor = 'thermal' | 'survey' | 'mesh' | 'detect' | 'lowlight' | 'timelapse' | 'cine' | 'live' | 'grade';

export interface Service {
  label: string;
  href: string;
  /** Photo in src/assets/services */
  image: string;
  sensor: Sensor;
}

export interface ServiceGroup {
  title: string;
  description: string;
  services: Service[];
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: 'Inspection, mesure et BTP',
    description: 'Des données fiables sur vos ouvrages, sans échafaudage ni nacelle.',
    services: [
      { label: 'Inspection thermique', href: '/inspection-thermique-par-drone-2/', image: 'inspection-thermique.jpg', sensor: 'thermal' },
      { label: 'Inspection visuelle', href: '/inspection-visuelle-par-drone/', image: 'inspection-visuelle.jpg', sensor: 'detect' },
      { label: 'Inspection en milieu confiné', href: '/inspection-en-milieu-confine-par-drone/', image: 'milieu-confine.jpg', sensor: 'lowlight' },
      { label: 'Topographie', href: '/topographie-par-drone-2/', image: 'topographie.jpg', sensor: 'survey' },
      { label: 'Modélisation 3D et photogrammétrie', href: '/modelisation-3d-drone/', image: 'modelisation-3d.jpg', sensor: 'mesh' },
      { label: 'Bureau d’étude', href: '/bureau-detude-drone/', image: 'bureau-etude.jpg', sensor: 'survey' },
      { label: 'Suivi de chantier en timelapse', href: '/suivi-de-chantier-timelapse/', image: 'suivi-chantier.jpg', sensor: 'timelapse' },
      { label: 'Nettoyage par drone', href: '/nettoyage-par-drone/', image: 'nettoyage.jpg', sensor: 'detect' },
      { label: 'Démoussage de toiture', href: '/demoussage-par-drone/', image: 'demoussage.jpg', sensor: 'detect' },
    ],
  },
  {
    title: 'Image et audiovisuel',
    description: 'Du plan aérien cinéma au film d’entreprise, tourné et monté par la même équipe.',
    services: [
      { label: 'Prises de vues aériennes cinéma', href: '/prises-de-vues-aeriennes-cinema-drone-lyon/', image: 'cinema.jpg', sensor: 'cine' },
      { label: 'Plan-séquence immersif en FPV', href: '/tournage-immersif-plan-sequence-fpv-lyon/', image: 'fpv.jpg', sensor: 'cine' },
      { label: 'Film d’entreprise', href: '/film-entreprise-corporate-lyon/', image: 'film-entreprise.jpg', sensor: 'cine' },
      { label: 'Live streaming et captation', href: '/live-streaming-captation-evenementielle-lyon/', image: 'live.jpg', sensor: 'live' },
      { label: 'Interview filmée', href: '/production-audiovisuelle-interview-lyon/', image: 'interview.jpg', sensor: 'cine' },
      { label: 'Cadreur', href: '/production-audiovisuelle-cadreur-lyon/', image: 'cadreur.jpg', sensor: 'cine' },
      { label: 'Post-production', href: '/postproduction-audiovisuelle-lyon/', image: 'post-production.jpg', sensor: 'grade' },
      { label: 'Mariage en photo et vidéo', href: '/mariage-photo-video-drone-lyon/', image: 'mariage.jpg', sensor: 'cine' },
    ],
  },
];

export const TEAM_INTRO = {
  title: 'Une petite équipe, des expertises complémentaires',
  text: 'Pilotage, technique, réalisation, organisation : chacun apporte son métier, et vous gardez le même interlocuteur du brief à la livraison.',
};

export interface Member {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  /** Illustrated avatar (components/ui/Avatar.astro). */
  avatar: AvatarId;
}

export const TEAM: Member[] = [
  {
    name: 'Dylan',
    role: 'Fondateur et directeur',
    bio: 'À l’origine des Drones Lyonnais, il dirige les opérations aériennes et intervient sur les projets techniques complexes et l’audiovisuel haut de gamme.',
    skills: ['Direction de projet', 'Pilotage drone', 'Photogrammétrie 3D', 'Thermographie', 'Audiovisuel'],
    avatar: 'dylan',
  },
  {
    name: 'Théo',
    role: 'Audiovisuel et formation',
    bio: 'Issu d’une école de cinéma, il signe la réalisation de nos productions et forme nos stagiaires aux métiers des médias et de la communication.',
    skills: ['Réalisation', 'Cadrage', 'Drone cinéma', 'FPV', 'Montage vidéo'],
    avatar: 'theo',
  },
  {
    name: 'Margot',
    role: 'Communication et relation client',
    bio: 'Elle suit chaque projet de près, organise les missions et fait vivre l’image de l’entreprise sur nos supports.',
    skills: ['Relation client', 'Organisation des projets', 'Suivi administratif', 'Réseaux sociaux'],
    avatar: 'margot',
  },
  {
    name: 'Pop',
    role: 'Mascotte officielle',
    bio: 'Toujours au bureau, il accueille les visiteurs et accompagne parfois l’équipe en tournage.',
    skills: ['Accueil des visiteurs', 'Moral des troupes', 'Expert officiel en câlins'],
    avatar: 'pop',
  },
];

export const COMMITMENTS = [
  {
    title: 'Expertise technique',
    text: 'Pilotes certifiés, matériel professionnel et maîtrise des environnements complexes, dans le respect total de la réglementation.',
  },
  {
    title: 'Regard artistique',
    text: 'Nous transformons vos idées en images fortes grâce à notre culture du cinéma et du récit visuel.',
  },
  {
    title: 'Réactivité',
    text: 'Basés à Lyon, nous nous adaptons à vos contraintes de temps et de lieu, partout en France, avec une logistique rodée.',
  },
  {
    title: 'Un seul interlocuteur',
    text: 'Un accompagnement sur mesure et le même contact, de la conception à la livraison.',
  },
];
