import React, { useState } from 'react';
import { EXERCISES, CATEGORY_LABELS } from '../data/exercises';
import type { ExerciseCategory } from '../types';

const CATEGORIES: ExerciseCategory[] = ['seated', 'standing', 'eyes', 'breathing'];

/**
 * Browsable exercise library with category filter tabs.
 */
export const ExerciseLibrary: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? EXERCISES
    : EXERCISES.filter(ex => ex.category === activeCategory);

  return (
    <div className="exercise-library">
      {/* Category filter */}
      <div className="category-tabs">
        <button
          className={`tab ${activeCategory === 'all' ? 'tab--active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`tab ${activeCategory === cat ? 'tab--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Exercise cards */}
      <div className="exercise-grid">
        {filtered.map(ex => (
          <div key={ex.id} className="exercise-card">
            <div className="exercise-icon">{ex.icon}</div>
            <div className="exercise-body">
              <div className="exercise-header">
                <span className="exercise-title">{ex.title}</span>
                <span className="exercise-duration">{ex.duration}</span>
              </div>
              <p className="exercise-desc">{ex.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
