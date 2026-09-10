import React from 'react';

const CategoryFilter = ({ categories, selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 py-2 rounded-full transition-all ${
          selected === 'all'
            ? 'bg-dustyRose text-white'
            : 'bg-white/30 text-gray-700 hover:bg-white/50'
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`px-4 py-2 rounded-full transition-all ${
            selected === cat.slug
              ? 'bg-dustyRose text-white'
              : 'bg-white/30 text-gray-700 hover:bg-white/50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;