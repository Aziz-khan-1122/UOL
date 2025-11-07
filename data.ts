
import type { Block } from './types';

export const initialBlocks: Block[] = [
  {
    id: 'block-1',
    name: 'Block A - Science Wing',
    rooms: [
      {
        id: 'room-1-1',
        name: 'Physics Lab (A-101)',
        items: [
          { id: 'item-1-1-1', name: 'Microscopes', quantity: 15, unitPrice: 350 },
          { id: 'item-1-1-2', name: 'Beakers (500ml)', quantity: 150, unitPrice: 5 },
          { id: 'item-1-1-3', name: 'Bunsen Burners', quantity: 20, unitPrice: 75 },
        ],
      },
      {
        id: 'room-1-2',
        name: 'Chemistry Lab (A-102)',
        items: [
          { id: 'item-1-2-1', name: 'Test Tubes', quantity: 500, unitPrice: 0.5 },
          { id: 'item-1-2-2', name: 'Safety Goggles', quantity: 50, unitPrice: 10 },
        ],
      },
    ],
  },
  {
    id: 'block-2',
    name: 'Block B - Arts & Humanities',
    rooms: [
      {
        id: 'room-2-1',
        name: 'Art Studio (B-205)',
        items: [
          { id: 'item-2-1-1', name: 'Easels', quantity: 25, unitPrice: 120 },
          { id: 'item-2-1-2', name: 'Canvas (24x36)', quantity: 100, unitPrice: 15 },
        ],
      },
    ],
  },
  {
    id: 'block-3',
    name: 'Block C - Computer Science',
    rooms: [
      {
        id: 'room-3-1',
        name: 'Main Computer Lab (C-301)',
        items: [
          { id: 'item-3-1-1', name: 'Desktop Computers', quantity: 60, unitPrice: 800 },
          { id: 'item-3-1-2', name: 'Ergonomic Chairs', quantity: 60, unitPrice: 150 },
          { id: 'item-3-1-3', name: 'Projectors', quantity: 4, unitPrice: 400 },
        ],
      },
      {
        id: 'room-3-2',
        name: 'Networking Lab (C-302)',
        items: [
          { id: 'item-3-2-1', name: 'Rack Servers', quantity: 8, unitPrice: 2500 },
          { id: 'item-3-2-2', name: 'Cisco Routers', quantity: 15, unitPrice: 500 },
        ],
      },
    ],
  },
];
