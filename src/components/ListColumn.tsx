// List component - displays a column of cards
// Uses dnd-kit's useSortable for horizontal list drag-and-drop
import React, { useState, useRef, useEffect } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import type { List } from '../types';
import { useBoardStore } from '../store/boardStore';
import { useFilteredCards } from '../hooks/useFilteredCards';
import CardItem from './CardItem';
import AddCard from './AddCard';

interface ListColumnProps {
  list: List;
}

const ListColumn: React.FC<ListColumnProps> = ({ list }) => {
  const updateListTitle = useBoardStore((s) => s.updateListTitle);
  const deleteList = useBoardStore((s) => s.deleteList);
  const cards = useFilteredCards(list.id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // dnd-kit sortable for list reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, data: { type: 'list', list } });

  // Droppable zone for cards being dragged into this list
  const { setNodeRef: setDropRef } = useDroppable({ id: `list-${list.id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.select();
  }, [isEditingTitle]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const saveTitle = () => {
    if (titleValue.trim()) updateListTitle(list.id, titleValue.trim());
    else setTitleValue(list.title);
    setIsEditingTitle(false);
  };

  const cardIds = cards.map((c) => c.id);

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`flex-shrink-0 w-72 flex flex-col max-h-full ${isDragging ? 'z-50' : ''}`}
    >
      <div className="bg-gray-100 rounded-xl flex flex-col max-h-[calc(100vh-180px)] shadow-sm">
        {/* List header */}
        <div className="flex items-center justify-between px-3 py-2.5 gap-1">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-0.5"
          >
            <GripVertical size={16} />
          </div>

          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') {
                  setTitleValue(list.title);
                  setIsEditingTitle(false);
                }
              }}
              className="flex-1 text-sm font-semibold text-gray-800 bg-white border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none"
            />
          ) : (
            <h2
              className="flex-1 text-sm font-semibold text-gray-800 px-1 cursor-pointer hover:bg-white/60 rounded py-0.5"
              onClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h2>
          )}

          {/* Card count */}
          <span className="text-xs text-gray-400 font-medium bg-gray-200 rounded-full px-1.5 py-0.5 min-w-[22px] text-center">
            {cards.length}
          </span>

          {/* Options menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                <button
                  onClick={() => { setIsEditingTitle(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={14} />
                  Rename list
                </button>
                <button
                  onClick={() => { deleteList(list.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete list
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards container */}
        <div
          ref={setDropRef}
          className="flex-1 overflow-y-auto px-2 py-1 space-y-2 scrollbar-thin min-h-[40px]"
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </SortableContext>
          {cards.length === 0 && (
            <div className="text-center text-xs text-gray-400 py-4 italic">Drop cards here</div>
          )}
        </div>

        {/* Add card button */}
        <div className="px-2 pb-2 pt-1">
          <AddCard listId={list.id} />
        </div>
      </div>
    </div>
  );
};

export default ListColumn;
