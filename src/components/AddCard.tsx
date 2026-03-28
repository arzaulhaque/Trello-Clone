// AddCard component - inline form to add a new card to a list
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';

interface AddCardProps {
  listId: string;
}

const AddCard: React.FC<AddCardProps> = ({ listId }) => {
  const addCard = useBoardStore((s) => s.addCard);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
  }, [isOpen]);

  const handleAdd = () => {
    if (title.trim()) {
      addCard(listId, title.trim());
      setTitle('');
      // Keep form open so user can add more cards
      textareaRef.current?.focus();
    }
  };

  const handleClose = () => {
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 hover:bg-white/60 hover:text-gray-700 rounded-lg transition-colors"
      >
        <Plus size={16} />
        Add a card
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
          }
          if (e.key === 'Escape') handleClose();
        }}
        placeholder="Enter a title for this card..."
        className="w-full p-2 text-sm border border-blue-400 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
        >
          Add card
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AddCard;
