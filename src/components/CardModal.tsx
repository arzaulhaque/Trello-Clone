// CardModal - Full card detail modal with labels, due date, checklist, members
import React, { useState, useEffect, useRef } from 'react';
import {
  X, Tag, Calendar, CheckSquare, Users, Trash2, Archive,
  Plus, Check, AlignLeft
} from 'lucide-react';
import { useBoardStore } from '../store/boardStore';
import { LABEL_COLORS, ALL_LABEL_COLORS } from '../utils/labelColors';
import { format, isBefore, startOfDay } from 'date-fns';
import type { LabelColor } from '../types';
import { nanoid } from '../store/utils/nanoid';

const CardModal: React.FC = () => {
  const activeCardId = useBoardStore((s) => s.activeCardId);
  const cards = useBoardStore((s) => s.cards);
  const lists = useBoardStore((s) => s.lists);
  const members = useBoardStore((s) => s.members);
  const closeCard = useBoardStore((s) => s.closeCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const archiveCard = useBoardStore((s) => s.archiveCard);
  const addLabel = useBoardStore((s) => s.addLabel);
  const removeLabel = useBoardStore((s) => s.removeLabel);
  const setDueDate = useBoardStore((s) => s.setDueDate);
  const addChecklistItem = useBoardStore((s) => s.addChecklistItem);
  const toggleChecklistItem = useBoardStore((s) => s.toggleChecklistItem);
  const removeChecklistItem = useBoardStore((s) => s.removeChecklistItem);
  const assignMember = useBoardStore((s) => s.assignMember);
  const unassignMember = useBoardStore((s) => s.unassignMember);

  const card = cards.find((c) => c.id === activeCardId);
  const list = lists.find((l) => l.id === card?.listId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(card?.title ?? '');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descVal, setDescVal] = useState(card?.description ?? '');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<LabelColor>('blue');
  const checkInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCard(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeCard]);

  if (!card || !activeCardId) return null;

  const today = startOfDay(new Date());
  const isOverdue = card.dueDate ? isBefore(new Date(card.dueDate), today) : false;

  const completedItems = card.checklist.filter((i) => i.completed).length;
  const progress = card.checklist.length > 0 ? (completedItems / card.checklist.length) * 100 : 0;

  const saveTitle = () => {
    if (titleVal.trim()) updateCard(card.id, { title: titleVal.trim() });
    setEditingTitle(false);
  };

  const saveDesc = () => {
    updateCard(card.id, { description: descVal });
    setEditingDesc(false);
  };

  const handleAddChecklist = () => {
    if (newCheckItem.trim()) {
      addChecklistItem(card.id, newCheckItem.trim());
      setNewCheckItem('');
      checkInputRef.current?.focus();
    }
  };

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      addLabel(card.id, { id: nanoid(), name: newLabelName.trim(), color: newLabelColor });
      setNewLabelName('');
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) closeCard(); }}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mt-8 mb-8"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-0">
          <div className="mt-1 text-gray-400">
            <AlignLeft size={18} />
          </div>
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                autoFocus
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') { setTitleVal(card.title); setEditingTitle(false); }
                }}
                className="w-full text-xl font-semibold text-gray-900 border-b-2 border-blue-400 focus:outline-none pb-0.5"
              />
            ) : (
              <h2
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:underline decoration-dashed"
                onClick={() => setEditingTitle(true)}
              >
                {card.title}
              </h2>
            )}
            <p className="text-sm text-gray-500 mt-1">
              in list <span className="font-medium text-gray-700">{list?.title}</span>
            </p>
          </div>
          <button
            onClick={closeCard}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 p-6 pt-4">
          {/* Main content */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Labels */}
            {card.labels.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Labels</h3>
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map((label) => (
                    <span
                      key={label.id}
                      className={`${LABEL_COLORS[label.color].bg} ${LABEL_COLORS[label.color].text} text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 group cursor-pointer`}
                      onClick={() => removeLabel(card.id, label.id)}
                      title="Click to remove"
                    >
                      {label.name}
                      <X size={10} className="opacity-0 group-hover:opacity-100" />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
              {editingDesc ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    className="w-full text-sm text-gray-700 border border-blue-400 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={4}
                    placeholder="Add a more detailed description..."
                  />
                  <div className="flex gap-2">
                    <button onClick={saveDesc} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors">
                      Save
                    </button>
                    <button onClick={() => { setDescVal(card.description); setEditingDesc(false); }} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-sm rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer min-h-[60px] transition-colors"
                >
                  {card.description || <span className="text-gray-400 italic">Add a description...</span>}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckSquare size={14} />
                  Checklist
                  {card.checklist.length > 0 && (
                    <span className="text-gray-400 font-normal normal-case">
                      ({completedItems}/{card.checklist.length})
                    </span>
                  )}
                </h3>
              </div>

              {/* Progress bar */}
              {card.checklist.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-8">{Math.round(progress)}%</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {card.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleChecklistItem(card.id, item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        item.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {item.completed && <Check size={10} />}
                    </button>
                    <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => removeChecklistItem(card.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <div className="mt-2 flex gap-2">
                <input
                  ref={checkInputRef}
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklist(); }}
                  placeholder="Add an item..."
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
                <button
                  onClick={handleAddChecklist}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="w-44 space-y-1.5 shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add to card</p>

            {/* Labels button */}
            <div className="relative">
              <button
                onClick={() => { setShowLabelPicker((v) => !v); setShowMemberPicker(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-lg transition-colors text-left"
              >
                <Tag size={14} />
                Labels
              </button>
              {showLabelPicker && (
                <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-3 space-y-3">
                  <p className="text-xs font-semibold text-gray-500">Add label</p>
                  <input
                    autoFocus
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); }}
                    placeholder="Label name..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="grid grid-cols-5 gap-1.5">
                    {ALL_LABEL_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewLabelColor(color)}
                        className={`${LABEL_COLORS[color].bg} w-8 h-8 rounded-md transition-transform hover:scale-110 ${
                          newLabelColor === color ? 'ring-2 ring-offset-1 ring-gray-600 scale-110' : ''
                        }`}
                        title={LABEL_COLORS[color].name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleAddLabel}
                    className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Add label
                  </button>
                  <div className="border-t pt-2">
                    <p className="text-xs text-gray-500 mb-1.5">Current labels (click to remove)</p>
                    <div className="flex flex-wrap gap-1">
                      {card.labels.map((l) => (
                        <span
                          key={l.id}
                          onClick={() => removeLabel(card.id, l.id)}
                          className={`${LABEL_COLORS[l.color].bg} ${LABEL_COLORS[l.color].text} text-xs px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80`}
                        >
                          {l.name} ×
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Due date */}
            <div>
              <label className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-lg transition-colors cursor-pointer">
                <Calendar size={14} />
                Due Date
                <input
                  type="date"
                  className="sr-only"
                  value={card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setDueDate(card.id, e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                />
              </label>
              {card.dueDate && (
                <div className="mt-1.5 px-3 flex items-center justify-between">
                  <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                    {format(new Date(card.dueDate), 'MMM d, yyyy')}
                    {isOverdue && ' (overdue)'}
                  </span>
                  <button
                    onClick={() => setDueDate(card.id, undefined)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Members button */}
            <div className="relative">
              <button
                onClick={() => { setShowMemberPicker((v) => !v); setShowLabelPicker(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-lg transition-colors text-left"
              >
                <Users size={14} />
                Members
              </button>
              {showMemberPicker && (
                <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Assign members</p>
                  {members.map((member) => {
                    const isAssigned = card.members.some((m) => m.id === member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() =>
                          isAssigned ? unassignMember(card.id, member.id) : assignMember(card.id, member)
                        }
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          isAssigned ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: member.color }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        >
                          {member.initials}
                        </div>
                        <span className="flex-1 text-left">{member.name}</span>
                        {isAssigned && <Check size={14} className="text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Members display */}
            {card.members.length > 0 && (
              <div className="px-1 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {card.members.map((m) => (
                    <div key={m.id} title={m.name} className="flex items-center gap-1.5">
                      <div
                        style={{ backgroundColor: m.color }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      >
                        {m.initials}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-2 mt-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</p>
              <button
                onClick={() => archiveCard(card.id)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-yellow-50 hover:text-yellow-700 text-sm text-gray-700 rounded-lg transition-colors text-left"
              >
                <Archive size={14} />
                Archive
              </button>
              <button
                onClick={() => deleteCard(card.id)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-sm text-gray-700 rounded-lg transition-colors text-left"
              >
                <Trash2 size={14} />
                Delete card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
