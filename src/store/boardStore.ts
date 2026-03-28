// Zustand store for the Trello Clone
// Manages boards, lists, cards, and filter state
import { create } from 'zustand';
import { nanoid } from './utils/nanoid';
import type { Board, List, Card, Label, ChecklistItem, Member, FilterState } from '../types';
import { MOCK_BOARD, MOCK_LISTS, MOCK_CARDS, MOCK_MEMBERS } from '../services/mockData';

interface BoardStore {
  // Data
  board: Board;
  lists: List[];
  cards: Card[];
  members: Member[];
  filters: FilterState;

  // Modal state
  activeCardId: string | null;

  // List actions
  addList: (title: string) => void;
  updateListTitle: (id: string, title: string) => void;
  deleteList: (id: string) => void;
  reorderLists: (orderedIds: string[]) => void;

  // Card actions
  addCard: (listId: string, title: string) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  archiveCard: (id: string) => void;
  moveCard: (cardId: string, toListId: string, toIndex: number) => void;
  reorderCards: (listId: string, orderedIds: string[]) => void;
  moveCardBetweenLists: (cardId: string, fromListId: string, toListId: string, toIndex: number) => void;

  // Card detail actions
  addLabel: (cardId: string, label: Label) => void;
  removeLabel: (cardId: string, labelId: string) => void;
  setDueDate: (cardId: string, date: string | undefined) => void;
  addChecklistItem: (cardId: string, text: string) => void;
  toggleChecklistItem: (cardId: string, itemId: string) => void;
  removeChecklistItem: (cardId: string, itemId: string) => void;
  assignMember: (cardId: string, member: Member) => void;
  unassignMember: (cardId: string, memberId: string) => void;

  // Modal actions
  openCard: (cardId: string) => void;
  closeCard: () => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  toggleLabelFilter: (labelId: string) => void;
  toggleMemberFilter: (memberId: string) => void;
  setDueDateFilter: (filter: FilterState['dueDate']) => void;
  clearFilters: () => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  board: MOCK_BOARD,
  lists: MOCK_LISTS,
  cards: MOCK_CARDS,
  members: MOCK_MEMBERS,
  filters: {
    searchQuery: '',
    labelIds: [],
    memberIds: [],
    dueDate: null,
  },
  activeCardId: null,

  // ── List actions ──────────────────────────────────────────────
  addList: (title) =>
    set((state) => ({
      lists: [
        ...state.lists,
        {
          id: nanoid(),
          boardId: state.board.id,
          title,
          order: state.lists.length,
        },
      ],
    })),

  updateListTitle: (id, title) =>
    set((state) => ({
      lists: state.lists.map((l) => (l.id === id ? { ...l, title } : l)),
    })),

  deleteList: (id) =>
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
      cards: state.cards.filter((c) => c.listId !== id),
    })),

  reorderLists: (orderedIds) =>
    set((state) => ({
      lists: orderedIds
        .map((id, order) => {
          const list = state.lists.find((l) => l.id === id)!;
          return { ...list, order };
        })
        .sort((a, b) => a.order - b.order),
    })),

  // ── Card actions ──────────────────────────────────────────────
  addCard: (listId, title) =>
    set((state) => {
      const listCards = state.cards.filter((c) => c.listId === listId);
      return {
        cards: [
          ...state.cards,
          {
            id: nanoid(),
            listId,
            title,
            description: '',
            labels: [],
            checklist: [],
            members: [],
            archived: false,
            order: listCards.length,
          },
        ],
      };
    }),

  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      activeCardId: state.activeCardId === id ? null : state.activeCardId,
    })),

  archiveCard: (id) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, archived: true } : c)),
      activeCardId: state.activeCardId === id ? null : state.activeCardId,
    })),

  moveCard: (cardId, toListId, toIndex) =>
    set((state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return state;
      const others = state.cards.filter((c) => c.listId === toListId && c.id !== cardId);
      others.splice(toIndex, 0, { ...card, listId: toListId });
      const reordered = others.map((c, i) => ({ ...c, order: i }));
      const rest = state.cards.filter((c) => c.listId !== toListId && c.id !== cardId);
      return { cards: [...rest, ...reordered] };
    }),

  reorderCards: (listId, orderedIds) =>
    set((state) => {
      const listCards = orderedIds.map((id, order) => {
        const card = state.cards.find((c) => c.id === id)!;
        return { ...card, order };
      });
      const others = state.cards.filter((c) => c.listId !== listId);
      return { cards: [...others, ...listCards] };
    }),

  moveCardBetweenLists: (cardId, _fromListId, toListId, toIndex) =>
    set((state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return state;
      // Remove from source list
      const withoutCard = state.cards.filter((c) => c.id !== cardId);
      // Get target list cards sorted
      const targetCards = withoutCard
        .filter((c) => c.listId === toListId)
        .sort((a, b) => a.order - b.order);
      // Insert at position
      targetCards.splice(toIndex, 0, { ...card, listId: toListId });
      const reindexedTarget = targetCards.map((c, i) => ({ ...c, order: i }));
      const others = withoutCard.filter((c) => c.listId !== toListId);
      return { cards: [...others, ...reindexedTarget] };
    }),

  // ── Card detail actions ────────────────────────────────────────
  addLabel: (cardId, label) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId && !c.labels.find((l) => l.id === label.id)
          ? { ...c, labels: [...c.labels, label] }
          : c
      ),
    })),

  removeLabel: (cardId, labelId) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId ? { ...c, labels: c.labels.filter((l) => l.id !== labelId) } : c
      ),
    })),

  setDueDate: (cardId, date) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === cardId ? { ...c, dueDate: date } : c)),
    })),

  addChecklistItem: (cardId, text) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              checklist: [
                ...c.checklist,
                { id: nanoid(), text, completed: false } as ChecklistItem,
              ],
            }
          : c
      ),
    })),

  toggleChecklistItem: (cardId, itemId) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              checklist: c.checklist.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : c
      ),
    })),

  removeChecklistItem: (cardId, itemId) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? { ...c, checklist: c.checklist.filter((item) => item.id !== itemId) }
          : c
      ),
    })),

  assignMember: (cardId, member) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId && !c.members.find((m) => m.id === member.id)
          ? { ...c, members: [...c.members, member] }
          : c
      ),
    })),

  unassignMember: (cardId, memberId) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId ? { ...c, members: c.members.filter((m) => m.id !== memberId) } : c
      ),
    })),

  // ── Modal actions ─────────────────────────────────────────────
  openCard: (cardId) => set({ activeCardId: cardId }),
  closeCard: () => set({ activeCardId: null }),

  // ── Filter actions ─────────────────────────────────────────────
  setSearchQuery: (query) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

  toggleLabelFilter: (labelId) =>
    set((state) => ({
      filters: {
        ...state.filters,
        labelIds: state.filters.labelIds.includes(labelId)
          ? state.filters.labelIds.filter((id) => id !== labelId)
          : [...state.filters.labelIds, labelId],
      },
    })),

  toggleMemberFilter: (memberId) =>
    set((state) => ({
      filters: {
        ...state.filters,
        memberIds: state.filters.memberIds.includes(memberId)
          ? state.filters.memberIds.filter((id) => id !== memberId)
          : [...state.filters.memberIds, memberId],
      },
    })),

  setDueDateFilter: (filter) =>
    set((state) => ({
      filters: { ...state.filters, dueDate: filter },
    })),

  clearFilters: () =>
    set({
      filters: { searchQuery: '', labelIds: [], memberIds: [], dueDate: null },
    }),
}));
