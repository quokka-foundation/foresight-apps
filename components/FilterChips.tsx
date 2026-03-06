'use client';

interface FilterChipsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function FilterChips({ categories, activeCategory, onSelect }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 px-5 py-2">
      {/* Filter icon */}
      <button className="flex-shrink-0 p-1.5 text-base-gray-200 hover:text-illoblack transition-colors" aria-label="Filter">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="6" y1="12" x2="18" y2="12" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      </button>

      {/* Chips */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5">
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`flex-shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-[0.75rem] font-medium tracking-[-0.01em] transition-all ${
                isActive
                  ? 'bg-illoblack text-white'
                  : 'bg-base-gray-25 text-base-gray-200 hover:bg-base-gray-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
