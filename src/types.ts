export interface Person {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Person[];
}

export interface Prize {
  id: string;
  name: string;
  count: number;
}

export type AppTab = 'list' | 'draw' | 'group';
