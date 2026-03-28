// API service layer - all backend API calls go through here
import axios from 'axios';
import type { Board, List, Card } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Board endpoints
export const boardService = {
  getBoard: (id: string): Promise<Board> =>
    api.get(`/boards/${id}`).then((r) => r.data),
};

// List endpoints
export const listService = {
  createList: (data: Omit<List, 'id'>): Promise<List> =>
    api.post('/lists', data).then((r) => r.data),

  updateList: (id: string, data: Partial<List>): Promise<List> =>
    api.put(`/lists/${id}`, data).then((r) => r.data),

  deleteList: (id: string): Promise<void> =>
    api.delete(`/lists/${id}`).then((r) => r.data),

  reorderLists: (lists: { id: string; order: number }[]): Promise<void> =>
    api.put('/lists/reorder', { lists }).then((r) => r.data),
};

// Card endpoints
export const cardService = {
  createCard: (data: Omit<Card, 'id'>): Promise<Card> =>
    api.post('/cards', data).then((r) => r.data),

  updateCard: (id: string, data: Partial<Card>): Promise<Card> =>
    api.put(`/cards/${id}`, data).then((r) => r.data),

  deleteCard: (id: string): Promise<void> =>
    api.delete(`/cards/${id}`).then((r) => r.data),

  reorderCards: (cards: { id: string; listId: string; order: number }[]): Promise<void> =>
    api.put('/cards/reorder', { cards }).then((r) => r.data),
};
