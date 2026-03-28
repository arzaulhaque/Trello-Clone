// Card component - displays a single card in a list
// Uses dnd-kit's useSortable for drag-and-drop within/between lists
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckSquare, Users, Pencil } from 'lucide-react';
import type { Card } from '../types';
import { useBoardStore } from '../store/boardStore';
import { LABEL_COLORS } from '../utils/labelColors';
import { format, isBefore, startOfDay, addDays } from 'date-fns';

interface CardItemProps {
  card: Card;
}

const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const openCard = useBoardStore((s) => s.openCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);

  // dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Due date status calculation
  const today = startOfDay(new Date());
  const isOverdue = card.dueDate ? isBefore(new Date(card.dueDate), today) : false;
  const isDueSoon = card.dueDate
    ? !isOverdue && isBefore(new Date(card.dueDate), addDays(today, 3))
    : false;

  const completedItems = card.checklist.filter((i) => i.completed).length;
  const totalItems = card.checklist.length;

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      updateCard(card.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 group hover:shadow-md transition-shadow cursor-pointer ${
        isDragging ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={() => !isEditingTitle && openCard(card.id)}
    >
      {/* Drag handle area */}
      <div
        {...attributes}
        {...listeners}
        className="px-3 pt-2 pb-0 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className={`${LABEL_COLORS[label.color].bg} ${LABEL_COLORS[label.color].text} text-xs px-2 py-0.5 rounded-full font-medium`}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card title */}
      <div className="px-3 pb-2">
        {isEditingTitle ? (
          <textarea
            autoFocus
            className="w-full text-sm text-gray-800 resize-none border border-blue-400 rounded p-1 focus:outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleTitleSave(); }
              if (e.key === 'Escape') { setEditTitle(card.title); setIsEditingTitle(false); }
            }}
            rows={2}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-start justify-between gap-1">
            <span className="text-sm text-gray-800 font-medium leading-snug">{card.title}</span>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-100 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
                setEditTitle(card.title);
              }}
              title="Quick edit title"
            >
              <Pencil size={12} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* Card metadata badges */}
        {(card.dueDate || totalItems > 0 || card.members.length > 0) && (
          <div className="flex items-center flex-wrap gap-2 mt-2">
            {/* Due date badge */}
            {card.dueDate && (
              <span
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${
                  isOverdue
                    ? 'bg-red-100 text-red-700'
                    : isDueSoon
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Calendar size={10} />
                {format(new Date(card.dueDate), 'MMM d')}
              </span>
            )}

            {/* Checklist progress badge */}
            {totalItems > 0 && (
              <span
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${
                  completedItems === totalItems
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <CheckSquare size={10} />
                {completedItems}/{totalItems}
              </span>
            )}

            {/* Members */}
            {card.members.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={10} />
                <div className="flex -space-x-1">
                  {card.members.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      title={m.name}
                      style={{ backgroundColor: m.color }}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-white"
                    >
                      {m.initials}
                    </div>
                  ))}
                  {card.members.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-[9px] font-bold border border-white">
                      +{card.members.length - 3}
                    </div>
                  )}
                </div>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardItem;
