// Search and filter bar for the board
import React, { useRef, useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';
import { LABEL_COLORS } from '../utils/labelColors';
import type { FilterState } from '../types';

const FilterBar: React.FC = () => {
  const filters = useBoardStore((s) => s.filters);
  const members = useBoardStore((s) => s.members);
  const cards = useBoardStore((s) => s.cards);
  const setSearchQuery = useBoardStore((s) => s.setSearchQuery);
  const toggleLabelFilter = useBoardStore((s) => s.toggleLabelFilter);
  const toggleMemberFilter = useBoardStore((s) => s.toggleMemberFilter);
  const setDueDateFilter = useBoardStore((s) => s.setDueDateFilter);
  const clearFilters = useBoardStore((s) => s.clearFilters);

  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Collect all unique labels from all cards
  const allLabels = Array.from(
    new Map(
      cards.flatMap((c) => c.labels).map((l) => [l.id, l])
    ).values()
  );

  const hasActiveFilters =
    filters.labelIds.length > 0 ||
    filters.memberIds.length > 0 ||
    filters.dueDate !== null;

  const dueDateOptions: { value: FilterState['dueDate']; label: string }[] = [
    { value: 'overdue', label: '🔴 Overdue' },
    { value: 'due-soon', label: '🟡 Due soon (3 days)' },
    { value: 'no-date', label: '⚪ No due date' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search input */}
      <div className="relative">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/70" />
        <input
          ref={inputRef}
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cards..."
          className="pl-8 pr-8 py-1.5 text-sm bg-white/20 hover:bg-white/30 focus:bg-white/90 text-white placeholder-white/70 focus:text-gray-800 focus:placeholder-gray-400 rounded-lg border border-white/30 focus:border-white focus:outline-none transition-colors w-48 focus:w-64"
        />
        {filters.searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter dropdown toggle */}
      <div className="relative">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            hasActiveFilters
              ? 'bg-white text-blue-600 border-white font-medium'
              : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
          }`}
        >
          Filter
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {filters.labelIds.length + filters.memberIds.length + (filters.dueDate ? 1 : 0)}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-30 p-4 space-y-4">
            {/* Labels */}
            {allLabels.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Labels</p>
                <div className="flex flex-wrap gap-1.5">
                  {allLabels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => toggleLabelFilter(label.id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                        LABEL_COLORS[label.color].bg
                      } ${LABEL_COLORS[label.color].text} ${
                        filters.labelIds.includes(label.id)
                          ? 'ring-2 ring-offset-1 ring-gray-600 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Members</p>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => toggleMemberFilter(member.id)}
                    title={member.name}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition-colors ${
                      filters.memberIds.includes(member.id)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: member.color }}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                    >
                      {member.initials}
                    </div>
                    <span>{member.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Due Date</p>
              <div className="space-y-1">
                {dueDateOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDueDateFilter(filters.dueDate === value ? null : value)}
                    className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                      filters.dueDate === value
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clear search shortcut */}
      {(filters.searchQuery || hasActiveFilters) && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-colors"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
