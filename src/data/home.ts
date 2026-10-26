// Homepage content. Copy taken from the current homepage and service pages,
// reorganised; links point to the URLs already indexed on the WordPress site.
import type { ImageMetadata } from 'astro';
import dylan from '../assets/team/dylan.png';
import theo from '../assets/team/theo.png';
import margot from '../assets/team/margot.png';
import pop from '../assets/team/pop.png';

export const HERO = {
  title: 'Pilotes de drone à\u00a0Lyon, en mission partout en France',
  intro:
    'Prises de vues aériennes, inspections techniques et formations de pilotes. Nous vendons et louons aussi le matériel que nous utilisons chaque jour.',
};

export const FACTS = [
  { value: '6 ans', label: 'd’expérience' },
  { value: '1 000+', label: 'missions réalisées' },
];

export interface ServiceGroup {
  title: string;
  description: string;
  services: { label: string; href: string }[];
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: 'Inspection, mesure et BTP',
    description: 'Des données fiables sur vos ouvrages, sans échafaudage ni nacelle.',
    services: [
      { label: 'Inspection thermique', href: '/inspection-thermique-par-drone-2/' },
      { label: 'Inspection visuelle', href: '/inspection-visuelle-par-drone/' },
      { label: 'Inspection en milieu confiné', href: '/inspection-en-milieu-confine-par-drone/' },
      { label: 'Topographie', href: '/topographie-par-drone-2/' },
      { label: 'Modélisation 3D et photogrammétrie', href: '/modelisation-3d-drone/' },
      { label: 'Bureau d’étude', href: '/bureau-detude-drone/' },
      { label: 'Suivi de chantier en timelapse', href: '/suivi-de-chantier-timelapse/' },
      { label: 'Nettoyage par drone', href: '/nettoyage-par-drone/' },
      { label: 'Démoussage de toiture', href: '/demoussage-par-drone/' },
    ],
  },
  {
    title: 'Image et audiovisuel',
    description: 'Du plan aérien cinéma au film d’entreprise, tourné et monté par la même équipe.',
    services: [
      { label: 'Prises de vues aériennes cinéma', href: '/prises-de-vues-aeriennes-cinema-drone-lyon/' },
      { label: 'Plan-séquence immersif en FPV', href: '/tournage-immersif-plan-sequence-fpv-lyon/' },
      { label: 'Film d’entreprise', href: '/film-entreprise-corporate-lyon/' },
      { label: 'Live streaming et captation', href: '/live-streaming-captation-evenementielle-lyon/' },
      { label: 'Interview filmée', href: '/production-audiovisuelle-interview-lyon/' },
      { label: 'Cadreur', href: '/production-audiovisuelle-cadreur-lyon/' },
      { label: 'Post-production', href: '/postproduction-audiovisuelle-lyon/' },
      { label: 'Mariage en photo et vidéo', href: '/mariage-photo-video-drone-lyon/' },
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
  photo: ImageMetadata;
}

export const TEAM: Member[] = [
  {
    name: 'Dylan',
    role: 'Fondateur et directeur',
    bio: 'À l’origine des Drones Lyonnais, il dirige les opérations aériennes et intervient sur les projets techniques complexes et l’audiovisuel haut de gamme.',
    skills: ['Direction de projet', 'Pilotage drone', 'Photogrammétrie 3D', 'Thermographie', 'Audiovisuel'],
    photo: dylan,
  },
  {
    name: 'Théo',
    role: 'Audiovisuel et formation',
    bio: 'Issu d’une école de cinéma, il signe la réalisation de nos productions et forme nos stagiaires aux métiers des médias et de la communication.',
    skills: ['Réalisation', 'Cadrage', 'Drone cinéma', 'FPV', 'Montage vidéo'],
    photo: theo,
  },
  {
    name: 'Margot',
    role: 'Communication et relation client',
    bio: 'Elle suit chaque projet de près, organise les missions et fait vivre l’image de l’entreprise sur nos supports.',
    skills: ['Relation client', 'Organisation des projets', 'Suivi administratif', 'Réseaux sociaux'],
    photo: margot,
  },
  {
    name: 'Pop',
    role: 'Mascotte officielle',
    bio: 'Toujours au bureau, il accueille les visiteurs et accompagne parfois l’équipe en tournage.',
    skills: ['Accueil des visiteurs', 'Moral des troupes', 'Expert officiel en câlins'],
    photo: pop,
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
