// Board page - the main Kanban board view
// Implements dnd-kit DnDContext for drag-and-drop of both lists and cards
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Settings } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';
import ListColumn from '../components/ListColumn';
import AddList from '../components/AddList';
import CardModal from '../components/CardModal';
import FilterBar from '../components/FilterBar';
import type { Card, List } from '../types';

// Overlay card shown while dragging (simplified view)
const DragOverlayCard: React.FC<{ card: Card }> = ({ card }) => (
  <div className="bg-white rounded-lg shadow-xl border border-blue-400 px-3 py-2 w-64 cursor-grabbing opacity-90 rotate-2">
    <p className="text-sm text-gray-800 font-medium">{card.title}</p>
  </div>
);

// Overlay list shown while dragging a list
const DragOverlayList: React.FC<{ list: List }> = ({ list }) => (
  <div className="bg-gray-100 rounded-xl px-4 py-3 w-72 shadow-xl opacity-90 cursor-grabbing rotate-1">
    <p className="text-sm font-semibold text-gray-800">{list.title}</p>
  </div>
);

const BoardPage: React.FC = () => {
  const board = useBoardStore((s) => s.board);
  const lists = useBoardStore((s) => s.lists);
  const cards = useBoardStore((s) => s.cards);
  const activeCardId = useBoardStore((s) => s.activeCardId);
  const reorderLists = useBoardStore((s) => s.reorderLists);
  const reorderCards = useBoardStore((s) => s.reorderCards);
  const moveCardBetweenLists = useBoardStore((s) => s.moveCardBetweenLists);

  // Track what is currently being dragged
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeList, setActiveList] = useState<List | null>(null);

  // Configure sensors - require 5px movement before drag starts
  // This prevents accidental drags when clicking
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Sorted lists for horizontal ordering
  const sortedLists = [...lists].sort((a, b) => a.order - b.order);
  const listIds = sortedLists.map((l) => l.id);

  const handleDragStart = (event: DragStartEvent) => {
    const { data } = event.active;
    if (data.current?.type === 'card') {
      setActiveCard(data.current.card);
      setActiveList(null);
    } else if (data.current?.type === 'list') {
      setActiveList(data.current.list);
      setActiveCard(null);
    }
  }, []  as unknown as never);

  // Called continuously as item moves over droppables
  const handleDragOver = (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeType = active.data.current?.type;
      if (activeType !== 'card') return;

      const activeCardData = active.data.current?.card as Card;
      if (!activeCardData) return;

      // Determine target list ID from what we're hovering over
      let overListId: string | null = null;
      if (over.id.toString().startsWith('list-')) {
        // Hovering over a list's drop zone
        overListId = over.id.toString().replace('list-', '');
      } else {
        // Hovering over another card - find its list
        const overCard = cards.find((c) => c.id === over.id);
        if (overCard) overListId = overCard.listId;
      }

      if (!overListId || activeCardData.listId === overListId) return;

      // Move card to the new list (visual feedback during drag)
      const targetCards = cards.filter((c) => c.listId === overListId && !c.archived).sort((a, b) => a.order - b.order);
      const overCardIndex = over.id.toString().startsWith('list-')
        ? targetCards.length // dropping on empty list → append
        : targetCards.findIndex((c) => c.id === over.id);

      moveCardBetweenLists(
        activeCardData.id,
        activeCardData.listId,
        overListId,
        overCardIndex >= 0 ? overCardIndex : targetCards.length
      );
    },
    [cards, moveCardBetweenLists]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCard(null);
      setActiveList(null);

      if (!over) return;

      const activeType = active.data.current?.type;

      if (activeType === 'list') {
        // Reorder lists
        const oldIndex = listIds.indexOf(active.id as string);
        const newIndex = listIds.indexOf(over.id as string);
        if (oldIndex !== newIndex && oldIndex >= 0 && newIndex >= 0) {
          const newOrder = arrayMove(listIds, oldIndex, newIndex);
          reorderLists(newOrder);
        }
      } else if (activeType === 'card') {
        // Final card position - reorder within list
        const card = cards.find((c) => c.id === active.id);
        if (!card) return;

        const listCards = cards
          .filter((c) => c.listId === card.listId && !c.archived)
          .sort((a, b) => a.order - b.order);

        const cardIds = listCards.map((c) => c.id);
        const overCard = cards.find((c) => c.id === over.id);
        const overInSameList = overCard && overCard.listId === card.listId;

        if (overInSameList) {
          const oldIndex = cardIds.indexOf(active.id as string);
          const newIndex = cardIds.indexOf(over.id as string);
          if (oldIndex !== newIndex && oldIndex >= 0 && newIndex >= 0) {
            const newOrder = arrayMove(cardIds, oldIndex, newIndex);
            reorderCards(card.listId, newOrder);
          }
        }
      }
    },
    [listIds, cards, reorderLists, reorderCards]
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${board.background} flex flex-col`}>
      {/* Navbar */}
      <header className="px-4 py-3 flex items-center justify-between bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <h1 className="text-white font-semibold text-lg">{board.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <FilterBar />
          <button className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Board area with horizontal scroll */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-4">
          <div className="flex items-start gap-3 h-full min-w-max">
            {/* Lists */}
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              {sortedLists.map((list) => (
                <ListColumn key={list.id} list={list} />
              ))}
            </SortableContext>

            {/* Add list button */}
            <AddList />
          </div>
        </main>

        {/* Drag overlays */}
        {createPortal(
          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeCard && <DragOverlayCard card={activeCard} />}
            {activeList && <DragOverlayList list={activeList} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Card detail modal */}
      {activeCardId && <CardModal />}
    </div>
  );
};

export default BoardPage;
