import type { GameDefinition } from '../interfaces/game.interface';

export const GAMES: readonly GameDefinition[] = [
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Consigue una mano cercana a 21.',
    route: '/games/blackjack',
    icon: 'card-outline',
  },
  {
    id: 'roulette',
    title: 'Ruleta',
    description: 'Gira la ruleta y descubre el resultado.',
    route: '/games/roulette',
    icon: 'disc-outline',
  },
  {
    id: 'poker',
    title: 'Póker',
    description: 'Forma la mejor combinación de cartas.',
    route: '/games/poker',
    icon: 'layers-outline',
  },
  {
    id: 'dice',
    title: 'Dados',
    description: 'Lanza los dados y descubre la suma.',
    route: '/games/dice',
    icon: 'dice-outline',
  },
  {
    id: 'slots',
    title: 'Tragamonedas',
    description: 'Combina los símbolos de los carretes.',
    route: '/games/slots',
    icon: 'grid-outline',
  },
  {
    id: 'baccarat',
    title: 'Bacará',
    description: 'Compara las manos de las dos bancas.',
    route: '/games/baccarat',
    icon: 'diamond-outline',
  },
];
