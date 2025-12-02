export interface Friend {
  id: string;
  name: string;
  description: string;
  avatar: string;
  url: string;
  theme?: string; // Main color for the card
  tags?: string[];
}

export const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Adnaan',
    description: 'Full-stack developer loving React and Node.js. Building digital dreams.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adnaan',
    url: 'http://www.adnaan.cn',
    theme: '#6366f1',
    tags: ['Dev', 'Tech', 'AI'],
  },
  {
    id: '2',
    name: 'Sarah Design',
    description: 'UI/UX Designer exploring the boundaries of web interaction.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    url: '#',
    theme: '#ec4899',
    tags: ['Design', 'Art'],
  },
  {
    id: '3',
    name: 'Cosmic Coder',
    description: 'Writing code under the starry sky. Rust & WebAssembly enthusiast.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cosmic',
    url: '#',
    theme: '#8b5cf6',
    tags: ['Rust', 'System'],
  },
  {
    id: '4',
    name: 'Pixel Walker',
    description: 'Game developer and pixel artist. Creating worlds bit by bit.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pixel',
    url: '#',
    theme: '#10b981',
    tags: ['GameDev', 'PixelArt'],
  },
  {
    id: '5',
    name: 'Tech Notes',
    description: 'A simple blog about complex things. Learning in public.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Notes',
    url: '#',
    theme: '#f59e0b',
    tags: ['Blog', 'Learning'],
  },
  {
    id: '6',
    name: 'AI Lab',
    description: 'Experimenting with LLMs and Generative Art.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AI',
    url: '#',
    theme: '#3b82f6',
    tags: ['AI', 'Research'],
  },
];
