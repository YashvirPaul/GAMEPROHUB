import React from 'react';
import { GameCategory } from '../types/game';

interface CategoryFilterProps {
  selectedCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  counts: Record<GameCategory, number>;
}

const CATEGORIES: { name: GameCategory; label: string }[] = [
  { name: 'All', label: 'All Modules' },
  { name: 'Math & Logic', label: 'Math & Logic' },
  { name: 'Equations', label: 'Equations' },
  { name: 'Memory & Recall', label: 'Memory' },
  { name: 'Vocabulary', label: 'Vocabulary' },
  { name: 'Focus & Speed', label: 'Focus & Speed' },
  { name: 'Practical Life', label: 'Practical Life' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div id="categories" className="w-full overflow-x-auto py-1 scrollbar-none">
      <div className="inline-flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.name;
          const count = counts[cat.name] || 0;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                isSelected
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.2 rounded font-medium ${
                  isSelected ? 'bg-zinc-700/80 text-zinc-100' : 'bg-zinc-850 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
