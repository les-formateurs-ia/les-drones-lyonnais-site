// Homepage content. Copy taken from the current homepage and service pages,
// reorganised; links point to the URLs already indexed on the WordPress site.
import type { ImageMetadata } from 'astro';
import { servicesOf, type Service } from './services';
import type { PortraitRig } from '../lib/live-portrait';
import dylan from '../assets/team/dylan.webp';
import theo from '../assets/team/theo.webp';
import margot from '../assets/team/margot.webp';
import pop from '../assets/team/pop.webp';

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

export interface ServiceGroup {
  title: string;
  description: string;
  services: Service[];
}

// The homepage screen lists the services by family (data/services.ts).
export const SERVICE_GROUPS: ServiceGroup[] = (['technique', 'artistique'] as const).map((family) => ({
  title: family === 'technique' ? 'Inspection, mesure et BTP' : 'Image et audiovisuel',
  description:
    family === 'technique'
      ? 'Des données fiables sur vos ouvrages, sans échafaudage ni nacelle.'
      : 'Du plan aérien cinéma au film d’entreprise, tourné et monté par la même équipe.',
  services: servicesOf(family),
}));

export const TEAM_INTRO = {
  title: 'Une petite équipe, des expertises complémentaires',
  text: 'Pilotage, technique, réalisation, organisation : chacun apporte son métier, et vous gardez le même interlocuteur du brief à la livraison.',
};

export interface Member {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  /** Cut-out portrait (transparent background). */
  photo: ImageMetadata;
  /** Landmarks on the photo that bring it to life (lib/live-portrait.ts). */
  rig: PortraitRig;
}

export const TEAM: Member[] = [
  {
    name: 'Dylan',
    role: 'Fondateur et directeur',
    bio: 'À l’origine des Drones Lyonnais, il dirige les opérations aériennes et intervient sur les projets techniques complexes et l’audiovisuel haut de gamme.',
    skills: ['Direction de projet', 'Pilotage drone', 'Photogrammétrie 3D', 'Thermographie', 'Audiovisuel'],
    photo: dylan,
    rig: { eyes: [[0.435, 0.367, 0.03, 0.012], [0.548, 0.357, 0.028, 0.011]], head: [0.495, 0.4, 0.15, 0.2], chin: 0.56 },
  },
  {
    name: 'Théo',
    role: 'Audiovisuel et formation',
    bio: 'Issu d’une école de cinéma, il signe la réalisation de nos productions et forme nos stagiaires aux métiers des médias et de la communication.',
    skills: ['Réalisation', 'Cadrage', 'Drone cinéma', 'FPV', 'Montage vidéo'],
    photo: theo,
    rig: { eyes: [[0.427, 0.352, 0.032, 0.011], [0.555, 0.34, 0.03, 0.011]], head: [0.495, 0.39, 0.15, 0.2], chin: 0.575 },
  },
  {
    name: 'Margot',
    role: 'Communication et relation client',
    bio: 'Elle suit chaque projet de près, organise les missions et fait vivre l’image de l’entreprise sur nos supports.',
    skills: ['Relation client', 'Organisation des projets', 'Suivi administratif', 'Réseaux sociaux'],
    photo: margot,
    rig: { eyes: [[0.4, 0.346, 0.03, 0.01], [0.521, 0.338, 0.027, 0.01]], head: [0.465, 0.37, 0.14, 0.19], chin: 0.53 },
  },
  {
    name: 'Pop',
    role: 'Mascotte officielle',
    bio: 'Toujours au bureau, il accueille les visiteurs et accompagne parfois l’équipe en tournage.',
    skills: ['Accueil des visiteurs', 'Moral des troupes', 'Expert officiel en câlins'],
    photo: pop,
    rig: { eyes: [[0.415, 0.417, 0.03, 0.013], [0.567, 0.417, 0.028, 0.013]], head: [0.5, 0.43, 0.24, 0.26], chin: 0.72, tongue: [0.5, 0.585, 0.045, 0.14] },
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
