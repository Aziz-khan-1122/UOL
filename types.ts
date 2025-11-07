
export interface Item {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Room {
  id: string;
  name: string;
  items: Item[];
}

export interface Block {
  id: string;
  name: string;
  rooms: Room[];
}
