// Hook to get filtered cards based on current filter state
import { useMemo } from 'react';
import { useBoardStore } from '../store/boardStore';
import type { Card } from '../types';
import { isAfter, isBefore, addDays, startOfDay } from 'date-fns';

export function useFilteredCards(listId: string): Card[] {
  const cards = useBoardStore((s) => s.cards);
  const filters = useBoardStore((s) => s.filters);

  return useMemo(() => {
    const today = startOfDay(new Date());
    const soon = addDays(today, 3);

    return cards
      .filter((card) => card.listId === listId && !card.archived)
      .filter((card) => {
        // Search by title
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          if (!card.title.toLowerCase().includes(q)) return false;
        }

        // Filter by labels
        if (filters.labelIds.length > 0) {
          const cardLabelIds = card.labels.map((l) => l.id);
          if (!filters.labelIds.some((id) => cardLabelIds.includes(id))) return false;
        }

        // Filter by members
        if (filters.memberIds.length > 0) {
          const cardMemberIds = card.members.map((m) => m.id);
          if (!filters.memberIds.some((id) => cardMemberIds.includes(id))) return false;
        }

        // Filter by due date
        if (filters.dueDate) {
          if (filters.dueDate === 'no-date') {
            if (card.dueDate) return false;
          } else if (filters.dueDate === 'overdue') {
            if (!card.dueDate || !isBefore(new Date(card.dueDate), today)) return false;
          } else if (filters.dueDate === 'due-soon') {
            if (!card.dueDate) return false;
            const due = new Date(card.dueDate);
            if (!isAfter(due, today) || !isBefore(due, soon)) return false;
          }
        }

        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [cards, filters, listId]);
}
