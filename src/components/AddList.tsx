// AddList - button/form to create a new list on the board
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';

const AddList: React.FC = () => {
  const addList = useBoardStore((s) => s.addList);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleAdd = () => {
    if (title.trim()) {
      addList(title.trim());
      setTitle('');
      inputRef.current?.focus();
    }
  };

  const handleClose = () => {
    setTitle('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="flex-shrink-0 w-72">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors backdrop-blur-sm"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Add another list</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-gray-100 rounded-xl p-2 space-y-2">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') handleClose();
          }}
          placeholder="Enter list title..."
          className="w-full text-sm border border-blue-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
          >
            Add list
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddList;
