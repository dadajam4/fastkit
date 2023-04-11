import { range } from '@fastkit/helpers';

export const MOCK_ITEMS_1 = [
  {
    value: 'home',
    label: 'Home',
  },
  {
    value: 'about',
    label: 'About',
  },
  {
    value: 'task',
    label: 'Task',
  },
  {
    value: 'settings',
    label: 'Settings',
  },
  ...range(5, 1).map((i) => ({
    value: `item${i}`,
    label: `item${i}`,
  })),
];
