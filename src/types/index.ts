// Core data types for the Trello Clone application

export type LabelColor =
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'blue'
  | 'sky'
  | 'lime'
  | 'pink'
  | 'black';

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  color: string;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  labels: Label[];
  dueDate?: string; // ISO date string
  checklist: ChecklistItem[];
  members: Member[];
  archived: boolean;
  order: number;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Board {
  id: string;
  title: string;
  background: string;
}

export interface FilterState {
  searchQuery: string;
  labelIds: string[];
  memberIds: string[];
  dueDate: 'overdue' | 'due-soon' | 'no-date' | null;
}
